import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, asc, eq, isNotNull, l2Distance, max, min } from "drizzle-orm";
import { Array, Effect, Layer, Option } from "effect";
import {
  matchingCursor,
  matchingUserAssessmentVector,
} from "sport-reservation-db/schema";
import { MatchingDbRepository } from "./matchingDbRepository";

export const matchingDbRepositoryImpl = /*@__PURE__*/ Layer.effect(
  MatchingDbRepository,
  Effect.gen(function* () {
    const db = yield* PgDrizzle;
    return MatchingDbRepository.of({
      matchUserCursor: (userId) =>
        Effect.gen(function* () {
          const matchUserAssessmentVectors = yield* db
            .select({
              activeMatchingVector:
                matchingUserAssessmentVector.activeMatchingVector,
            })
            .from(matchingUserAssessmentVector)
            .where(
              and(
                isNotNull(matchingUserAssessmentVector.deletedAt),
                eq(
                  matchingUserAssessmentVector.vectorVersion,
                  Array.pad([1, 1, 1, 1], 16, 0),
                ),
                eq(matchingUserAssessmentVector.userId, userId),
              ),
            );

          const randomNoiseUserAssessmentVectors = (
            matchUserAssessmentVectors[0] ?? Array.replicate(0, 256)
          ).activeMatchingVector.map(
            (value) => value + (Math.random() - 0.5) * 0.05,
          );

          const cursor = yield* db
            .insert(matchingCursor)
            .values({
              vectorVersion: Array.pad([1, 1, 1, 1], 16, 0),
              vector: randomNoiseUserAssessmentVectors,
            })
            .returning({ publicId: matchingCursor.publicId });

          if (cursor.length === 0) {
            return Option.none();
          }

          return Option.some({ cursorId: cursor[0].publicId });
        }),
      matchUser: (cursorId, limit) =>
        Effect.gen(function* () {
          const cursors = yield* db
            .select()
            .from(matchingCursor)
            .where(
              and(
                isNotNull(matchingCursor.deletedAt),
                eq(
                  matchingCursor.vectorVersion,
                  Array.pad([1, 1, 1, 1], 16, 0),
                ),
                eq(matchingCursor.publicId, cursorId),
              ),
            );

          if (Array.isEmptyArray(cursors)) {
            return [];
          }

          const vector = cursors[0].vector;

          const distanceTable = db.$with(`distanceTable`).as(
            db
              .select({
                userId: matchingUserAssessmentVector.userId,
                distance: l2Distance(
                  matchingUserAssessmentVector.passiveMatchingVector,
                  vector,
                )
                  .mapWith(Number)
                  .as("distance"),
              })
              .from(matchingUserAssessmentVector),
          );

          const matchesUserAssessment = yield* db
            .with(distanceTable)
            .select({
              userId: distanceTable.userId,
              distance: distanceTable.distance,
              minDistance: min(distanceTable.distance)
                .mapWith(Number)
                .as("minDistance"),
              maxDistance: max(distanceTable.distance)
                .mapWith(Number)
                .as("maxDistance"),
            })
            .from(distanceTable)
            .orderBy(asc(distanceTable.distance))
            .limit(limit);

          return matchesUserAssessment;
        }),
    });
  }),
);
