import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  l2Distance,
  lte,
  max,
  min,
  sql,
} from "drizzle-orm";
import {
  Array,
  Chunk,
  Effect,
  Layer,
  Option,
  pipe,
  Random,
  Stream,
} from "effect";
import {
  matchingCursor,
  matchingCursorGender,
  matchingCursorMatches,
  matchingCursorObjectiveCategory,
  matchingUserAssessmentVector,
  userObjective,
  userObjectiveCategory,
  userUserProfile,
  userUserProfileObjective,
} from "sport-reservation-db/schema";
import { MatchingDbRepository } from "./matchingDbRepository";

export const matchingDbRepositoryImpl = /*@__PURE__*/ Layer.effect(
  MatchingDbRepository,
  Effect.gen(function* () {
    const db = yield* PgDrizzle;
    return MatchingDbRepository.of({
      createMatchUserCursor: ({
        userId,
        minAge,
        maxAge,
        gender,
        objectiveCategory,
      }) =>
        Effect.gen(function* () {
          const matchUserAssessmentVectors = yield* db
            .select({
              activeMatchingVector:
                matchingUserAssessmentVector.activeMatchingVector,
            })
            .from(matchingUserAssessmentVector)
            .where(
              and(
                isNull(matchingUserAssessmentVector.deletedAt),
                eq(
                  matchingUserAssessmentVector.vectorVersion,
                  Array.pad([1, 1, 1, 1], 16, 0),
                ),
                eq(matchingUserAssessmentVector.userId, userId),
              ),
            );

          const randomNoiseUserAssessmentVectors = (
            Array.isEmptyArray(matchUserAssessmentVectors)
              ? Array.replicate(0, 256)
              : matchUserAssessmentVectors[0].activeMatchingVector
          ).map((value) => value + (Math.random() - 0.5) * 0.05);

          const cursors = yield* db
            .insert(matchingCursor)
            .values({
              userId,
              vectorVersion: Array.pad([1, 1, 1, 1], 16, 0),
              vector: randomNoiseUserAssessmentVectors,
              minAge,
              maxAge,
            })
            .returning();

          if (Array.isEmptyArray(cursors)) {
            return Option.none();
          }

          const cursor = cursors[0];

          if (gender.length > 0) {
            yield* db.insert(matchingCursorGender).values(
              gender.map((gender) => ({
                cursorId: cursor.publicId,
                gender,
              })),
            );
          }

          if (objectiveCategory.length > 0) {
            yield* db.insert(matchingCursorObjectiveCategory).values(
              objectiveCategory.map((category) => ({
                cursorId: cursor.publicId,
                objectiveCategory: category,
              })),
            );
          }

          return Option.some(cursor);
        }),
      getMatchUserCursor: (userId) =>
        Effect.gen(function* () {
          const cursors = yield* db
            .select()
            .from(matchingCursor)
            .where(
              and(
                isNull(matchingCursor.deletedAt),
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
                isNull(matchingCursorMatches.deletedAt),
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
                isNull(matchingCursorMatches.deletedAt),
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
                isNull(matchingCursor.deletedAt),
                eq(
                  matchingCursor.vectorVersion,
                  Array.pad([1, 1, 1, 1], 16, 0),
                ),
                eq(matchingCursor.publicId, cursorId),
              ),
            );

          const cursorGenders = yield* db
            .select({
              gender: matchingCursorGender.gender,
            })
            .from(matchingCursorGender)
            .where(
              and(
                isNull(matchingCursorGender.deletedAt),
                eq(matchingCursorGender.cursorId, cursorId),
              ),
            );

          const cursorObjectiveCategories = yield* db
            .select({
              objectiveCategory:
                matchingCursorObjectiveCategory.objectiveCategory,
            })
            .from(matchingCursorObjectiveCategory)
            .where(
              and(
                isNull(matchingCursorObjectiveCategory.deletedAt),
                eq(matchingCursorObjectiveCategory.cursorId, cursorId),
              ),
            );

          if (Array.isEmptyArray(cursors)) {
            return [];
          }

          const cursor = cursors[0];

          const satisfiedUserProfileIdsCTE = db
            .$with(`satisfiedUserProfileIds`)
            .as(
              db
                .selectDistinct({
                  userId: userUserProfile.id,
                })
                .from(userUserProfile)
                .innerJoin(
                  userUserProfileObjective,
                  eq(userUserProfile.id, userUserProfileObjective.userId),
                )
                .innerJoin(
                  userObjective,
                  eq(
                    userUserProfileObjective.objectiveId,
                    userObjective.publicId,
                  ),
                )
                .innerJoin(
                  userObjectiveCategory,
                  eq(
                    userObjective.objectiveType,
                    userObjectiveCategory.objectiveType,
                  ),
                )
                .where(
                  and(
                    isNull(userUserProfile.deletedAt),
                    cursor.minAge
                      ? gte(
                          userUserProfile.birthDate,
                          new Date(
                            Date.now() -
                              cursor.minAge * 365 * 24 * 60 * 60 * 1000,
                          ),
                        )
                      : undefined,
                    cursor.maxAge
                      ? lte(
                          userUserProfile.birthDate,
                          new Date(
                            Date.now() -
                              cursor.maxAge * 365 * 24 * 60 * 60 * 1000,
                          ),
                        )
                      : undefined,
                    cursorGenders.length > 0
                      ? inArray(
                          userUserProfile.gender,
                          cursorGenders.map(({ gender }) => gender),
                        )
                      : undefined,
                    cursorObjectiveCategories.length > 0
                      ? inArray(
                          userObjectiveCategory.categoryType,
                          cursorObjectiveCategories.map(
                            ({ objectiveCategory }) => objectiveCategory,
                          ),
                        )
                      : undefined,
                  ),
                ),
            );

          const [{ count: rowCount }] = yield* db
            .with(satisfiedUserProfileIdsCTE)
            .select({
              count: count(),
            })
            .from(matchingUserAssessmentVector)
            .innerJoin(
              satisfiedUserProfileIdsCTE,
              eq(
                matchingUserAssessmentVector.userId,
                satisfiedUserProfileIdsCTE.userId,
              ),
            )
            .where(
              and(
                isNull(matchingUserAssessmentVector.deletedAt),
                eq(
                  matchingUserAssessmentVector.vectorVersion,
                  Array.pad([1, 1, 1, 1], 16, 0),
                ),
              ),
            );

          console.log(rowCount);

          const exactMatchRows = yield* pipe(
            Stream.repeatEffect(
              Random.nextIntBetween(1, Math.ceil((rowCount + 1) * 0.1)),
            ),
            Stream.take(exactMatchCount),
            Stream.runCollect,
            Effect.map(Chunk.toReadonlyArray),
          );

          const generalMatchRows = yield* pipe(
            Stream.repeatEffect(Random.nextIntBetween(1, rowCount + 1)),
            Stream.take(generalMatchCount),
            Stream.runCollect,
            Effect.map(Chunk.toReadonlyArray),
          );

          const matchRows = [...exactMatchRows, ...generalMatchRows];

          const distanceTable = db.$with(`distanceTable`).as(
            db
              .with(satisfiedUserProfileIdsCTE)
              .select({
                userId: matchingUserAssessmentVector.userId,
                distance: l2Distance(
                  matchingUserAssessmentVector.passiveMatchingVector,
                  cursor.vector,
                )
                  .mapWith(Number)
                  .as("distance"),
              })
              .from(matchingUserAssessmentVector)
              .innerJoin(
                satisfiedUserProfileIdsCTE,
                eq(
                  matchingUserAssessmentVector.userId,
                  satisfiedUserProfileIdsCTE.userId,
                ),
              )
              .where(
                and(
                  isNull(matchingUserAssessmentVector.deletedAt),
                  eq(
                    matchingUserAssessmentVector.vectorVersion,
                    Array.pad([1, 1, 1, 1], 16, 0),
                  ),
                ),
              ),
          );

          const minMaxDistanceTable = db.$with(`minMaxDistance`).as(
            db
              .with(distanceTable)
              .select({
                minDistance: min(distanceTable.distance)
                  .mapWith(Number)
                  .as("minDistance"),
                maxDistance: max(distanceTable.distance)
                  .mapWith(Number)
                  .as("maxDistance"),
              })
              .from(distanceTable),
          );

          const matchesUserAssessment = db.$with(`matchesUserAssessment`).as(
            db
              .with(distanceTable, minMaxDistanceTable)
              .select({
                userId: distanceTable.userId,
                distance: distanceTable.distance,
                minDistance: minMaxDistanceTable.minDistance,
                maxDistance: minMaxDistanceTable.maxDistance,
                rank: sql`row_number() over (order by "distance")`
                  .mapWith(Number)
                  .as("rank"),
              })
              .from(distanceTable)
              .innerJoin(minMaxDistanceTable, sql`true`)
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
