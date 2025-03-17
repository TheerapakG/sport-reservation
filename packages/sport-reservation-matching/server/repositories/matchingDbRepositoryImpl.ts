import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import {
  and,
  asc,
  eq,
  isNotNull,
  l2Distance,
  max,
  min,
  sql,
  SQL,
} from "drizzle-orm";
import { Array, Effect, Layer } from "effect";
import {
  matchingUserBadmintonAssessmentVector,
  matchingUserGeneralAssessmentVector,
  matchingUserRunningAssessmentVector,
  matchingUserTennisAssessmentVector,
} from "sport-reservation-db/schema";
import { MatchingDbRepository } from "./matchingDbRepository";

const VECTOR_VERSIONS = {
  general: 1,
  badminton: 1,
  tennis: 1,
  running: 1,
} as const;

export const matchingDbRepositoryImpl = /*@__PURE__*/ Layer.effect(
  MatchingDbRepository,
  Effect.gen(function* () {
    const db = yield* PgDrizzle;
    return MatchingDbRepository.of({
      matchUser: (userId, limit) =>
        Effect.gen(function* () {
          const matchUserAssessmentVectors = yield* Effect.all(
            (
              [
                [matchingUserGeneralAssessmentVector, VECTOR_VERSIONS.general],
                [
                  matchingUserBadmintonAssessmentVector,
                  VECTOR_VERSIONS.badminton,
                ],
                [matchingUserTennisAssessmentVector, VECTOR_VERSIONS.tennis],
                [matchingUserRunningAssessmentVector, VECTOR_VERSIONS.running],
              ] as const
            ).map(([assessmentVectorTable, vectorVersion]) =>
              Effect.gen(function* () {
                const vectors = yield* db
                  .select({
                    activeMatchingVector:
                      assessmentVectorTable.activeMatchingVector,
                  })
                  .from(assessmentVectorTable)
                  .where(
                    and(
                      isNotNull(assessmentVectorTable.deletedAt),
                      eq(assessmentVectorTable.vectorVersion, vectorVersion),
                      eq(assessmentVectorTable.userId, userId),
                    ),
                  );

                return vectors.length === 0
                  ? Array.pad([], 64, 0)
                  : vectors[0].activeMatchingVector;
              }),
            ),
          );

          const randomNoiseUserAssessmentVectors =
            matchUserAssessmentVectors.map((vector) =>
              vector.map((value) => value + (Math.random() - 0.5) * 0.05),
            );

          const distanceTables = [
            db.$with(`notDeletedGeneralAssessmentDistance`).as(
              db
                .select({
                  userId: matchingUserGeneralAssessmentVector.userId,
                  distance: l2Distance(
                    matchingUserGeneralAssessmentVector.passiveMatchingVector,
                    randomNoiseUserAssessmentVectors[0],
                  ) as SQL<number>,
                })
                .from(matchingUserGeneralAssessmentVector)
                .where(
                  and(
                    isNotNull(matchingUserGeneralAssessmentVector.deletedAt),
                    eq(
                      matchingUserGeneralAssessmentVector.vectorVersion,
                      VECTOR_VERSIONS.general,
                    ),
                  ),
                ),
            ),
            db.$with(`notDeletedBadmintonAssessmentDistance`).as(
              db
                .select({
                  userId: matchingUserBadmintonAssessmentVector.userId,
                  distance: l2Distance(
                    matchingUserBadmintonAssessmentVector.passiveMatchingVector,
                    randomNoiseUserAssessmentVectors[1],
                  ) as SQL<number>,
                })
                .from(matchingUserBadmintonAssessmentVector)
                .where(
                  and(
                    isNotNull(matchingUserBadmintonAssessmentVector.deletedAt),
                    eq(
                      matchingUserBadmintonAssessmentVector.vectorVersion,
                      VECTOR_VERSIONS.badminton,
                    ),
                  ),
                ),
            ),
            db.$with(`notDeletedTennisAssessmentDistance`).as(
              db
                .select({
                  userId: matchingUserTennisAssessmentVector.userId,
                  distance: l2Distance(
                    matchingUserTennisAssessmentVector.passiveMatchingVector,
                    randomNoiseUserAssessmentVectors[2],
                  ) as SQL<number>,
                })
                .from(matchingUserTennisAssessmentVector)
                .where(
                  and(
                    isNotNull(matchingUserTennisAssessmentVector.deletedAt),
                    eq(
                      matchingUserTennisAssessmentVector.vectorVersion,
                      VECTOR_VERSIONS.tennis,
                    ),
                  ),
                ),
            ),
            db.$with(`notDeletedRunningAssessmentDistance`).as(
              db
                .select({
                  userId: matchingUserRunningAssessmentVector.userId,
                  distance: l2Distance(
                    matchingUserRunningAssessmentVector.passiveMatchingVector,
                    randomNoiseUserAssessmentVectors[3],
                  ) as SQL<number>,
                })
                .from(matchingUserRunningAssessmentVector)
                .where(
                  and(
                    isNotNull(matchingUserRunningAssessmentVector.deletedAt),
                    eq(
                      matchingUserRunningAssessmentVector.vectorVersion,
                      VECTOR_VERSIONS.running,
                    ),
                  ),
                ),
            ),
          ] as const;

          const sumDistanceTable = db.$with(`sumDistanceTable`).as(
            db
              .with(...distanceTables)
              .select({
                userId: distanceTables[0].userId,
                distance: sql`
                coalesce(${distanceTables[0].distance}, (${l2Distance(sql`'${randomNoiseUserAssessmentVectors[0]}'::vector'`, Array.pad([], 64, 0))})) + 
                coalesce(${distanceTables[1].distance}, (${l2Distance(sql`'${randomNoiseUserAssessmentVectors[1]}'::vector'`, Array.pad([], 64, 0))})) + 
                coalesce(${distanceTables[2].distance}, (${l2Distance(sql`'${randomNoiseUserAssessmentVectors[2]}'::vector'`, Array.pad([], 64, 0))})) + 
                coalesce(${distanceTables[3].distance}, (${l2Distance(sql`'${randomNoiseUserAssessmentVectors[3]}'::vector'`, Array.pad([], 64, 0))}))`
                  .mapWith(Number)
                  .as("distance"),
              })
              .from(distanceTables[0])
              .leftJoin(
                distanceTables[1],
                eq(distanceTables[0].userId, distanceTables[1].userId),
              )
              .leftJoin(
                distanceTables[2],
                eq(distanceTables[0].userId, distanceTables[2].userId),
              )
              .leftJoin(
                distanceTables[3],
                eq(distanceTables[0].userId, distanceTables[3].userId),
              ),
          );

          const matchesUserAssessment = yield* db
            .with(sumDistanceTable)
            .select({
              userId: distanceTables[0].userId,
              distance: sumDistanceTable.distance,
              minDistance: min(sumDistanceTable.distance)
                .mapWith(Number)
                .as("minDistance"),
              maxDistance: max(sumDistanceTable.distance)
                .mapWith(Number)
                .as("maxDistance"),
            })
            .from(sumDistanceTable)
            .orderBy(asc(sumDistanceTable.distance))
            .limit(limit);

          return matchesUserAssessment;
        }),
    });
  }),
);
