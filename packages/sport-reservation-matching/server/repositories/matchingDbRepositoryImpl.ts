import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  l2Distance,
  max,
  min,
  sql,
} from "drizzle-orm";
import { Array, Effect, Layer, Option, pipe, Random, Stream } from "effect";
import {
  matchingCursor,
  matchingCursorMatches,
  matchingUserAssessmentVector,
} from "sport-reservation-db/schema";
import { MatchingDbRepository } from "./matchingDbRepository";

export const matchingDbRepositoryImpl = /*@__PURE__*/ Layer.effect(
  MatchingDbRepository,
  Effect.gen(function* () {
    const db = yield* PgDrizzle;
    return MatchingDbRepository.of({
      createMatchUserCursor: (userId) =>
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

          console.log(
            db
              .insert(matchingCursor)
              .values({
                userId,
                vectorVersion: Array.pad([1, 1, 1, 1], 16, 0),
                vector: randomNoiseUserAssessmentVectors,
              })
              .returning()
              .getSQL(),
          );

          const cursors = yield* db
            .insert(matchingCursor)
            .values({
              userId,
              vectorVersion: Array.pad([1, 1, 1, 1], 16, 0),
              vector: randomNoiseUserAssessmentVectors,
            })
            .returning();

          if (Array.isEmptyArray(cursors)) {
            return Option.none();
          }

          return Option.some(cursors[0]);
        }),
      getMatchUserCursor: (userId) =>
        Effect.gen(function* () {
          const cursors = yield* db
            .select()
            .from(matchingCursor)
            .where(
              and(
                isNotNull(matchingCursor.deletedAt),
                eq(matchingCursor.userId, userId),
              ),
            )
            .orderBy(desc(matchingCursor.createdAt));

          if (Array.isEmptyArray(cursors)) {
            return Option.none();
          }

          return Option.some(cursors[0]);
        }),
      getCursorMatchCount: (cursorId) =>
        Effect.gen(function* () {
          const counts = yield* db
            .select({ count: count() })
            .from(matchingCursorMatches)
            .where(
              and(
                isNotNull(matchingCursorMatches.deletedAt),
                eq(matchingCursorMatches.cursorId, cursorId),
              ),
            );

          if (Array.isEmptyArray(counts)) {
            return 0;
          }

          return counts[0].count;
        }),
      getCursorMatches: (cursorId) =>
        Effect.gen(function* () {
          return yield* db
            .select()
            .from(matchingCursorMatches)
            .where(
              and(
                isNotNull(matchingCursorMatches.deletedAt),
                eq(matchingCursorMatches.cursorId, cursorId),
              ),
            );
        }),
      matchUser: (cursorId, exactMatchCount, generalMatchCount) =>
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

          const [{ count: rowCount }] = yield* db
            .select({
              count: count(),
            })
            .from(matchingUserAssessmentVector)
            .where(
              and(
                isNotNull(matchingUserAssessmentVector.deletedAt),
                eq(
                  matchingUserAssessmentVector.vectorVersion,
                  Array.pad([1, 1, 1, 1], 16, 0),
                ),
              ),
            );

          const { vector } = cursors[0];
          const exactMatchRows = [
            ...(yield* Stream.runCollect(
              pipe(
                Stream.repeatEffect(
                  Random.nextIntBetween(1, Math.ceil((rowCount + 1) * 0.1)),
                ),
                Stream.take(exactMatchCount),
              ),
            )),
          ];
          const generalMatchRows = [
            ...(yield* Stream.runCollect(
              pipe(
                Stream.repeatEffect(Random.nextIntBetween(1, rowCount + 1)),
                Stream.take(generalMatchCount),
              ),
            )),
          ];
          const matchRows = [...exactMatchRows, ...generalMatchRows];

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
              .from(matchingUserAssessmentVector)
              .where(
                and(
                  isNotNull(matchingUserAssessmentVector.deletedAt),
                  eq(
                    matchingUserAssessmentVector.vectorVersion,
                    Array.pad([1, 1, 1, 1], 16, 0),
                  ),
                ),
              ),
          );

          const matchesUserAssessment = db.$with(`matchesUserAssessment`).as(
            db
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
                rank: sql`row_number() over (order by "distance")`
                  .mapWith(Number)
                  .as("rank"),
              })
              .from(distanceTable)
              .orderBy(asc(distanceTable.distance)),
          );

          const matches = yield* db
            .with(matchesUserAssessment)
            .select({
              userId: matchesUserAssessment.userId,
              distance: matchesUserAssessment.distance,
              minDistance: matchesUserAssessment.minDistance,
              maxDistance: matchesUserAssessment.maxDistance,
            })
            .from(matchesUserAssessment)
            .where(inArray(matchesUserAssessment.rank, matchRows));

          yield* db.insert(matchingCursorMatches).values(
            matches.map((match) => ({
              cursorId,
              userId: match.userId,
              distance: match.distance,
              minDistance: match.minDistance,
              maxDistance: match.maxDistance,
            })),
          );

          return matches;
        }),
    });
  }),
);
