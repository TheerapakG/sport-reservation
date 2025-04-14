import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull, sql } from "drizzle-orm";
import {
  Array,
  Chunk,
  Effect,
  Layer,
  Number,
  Option,
  pipe,
  Stream,
} from "effect";
import {
  matchingUserAssessmentVector,
  matchingUserBadmintonAssessment,
  matchingUserGeneralAssessment,
  matchingUserRunningAssessment,
  matchingUserTennisAssessment,
} from "sport-reservation-db/schema";
import { effectType } from "tiara-stack/utils/effectType";
import {
  badmintonAssessmentSchemas,
  generalAssessmentSchemas,
  runningAssessmentSchemas,
  tennisAssessmentSchemas,
} from "~/models";
import { AssessmentDbRepository } from "./assessmentDbRepository";

const minMaxScaler =
  ({ minimum, maximum }: { minimum: number; maximum: number }) =>
  (value: number) =>
    Number.unsafeDivide(
      Number.clamp({ minimum, maximum })(value) - minimum,
      maximum - minimum,
    );

export const assessmentDbRepositoryImpl = /*@__PURE__*/ Layer.effect(
  AssessmentDbRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;
    return AssessmentDbRepository.of({
      createGeneralV1Assessment: (userId, userGeneralAssessment) =>
        Effect.gen(function* () {
          const {
            vigorousDays,
            vigorousMinutes,
            moderateDays,
            moderateMinutes,
            walkDays,
            walkMinutes,
          } = userGeneralAssessment;
          const [vigorousMET, moderateMET, walkMET] = [
            8 * vigorousDays * vigorousMinutes,
            4 * moderateDays * moderateMinutes,
            2 * walkDays * walkMinutes,
          ];
          const totalMET = vigorousMET + moderateMET + walkMET;
          const passiveMatchingVectorComponents = {
            totalMET:
              0.5 * minMaxScaler({ minimum: 200, maximum: 8640 })(totalMET),
          };
          const activeMatchingVectorComponents = {
            totalMET:
              0.5 * minMaxScaler({ minimum: 200, maximum: 8640 })(totalMET),
          };

          const passiveMatchingVector = Array.pad(
            [passiveMatchingVectorComponents.totalMET],
            16,
            0,
          );
          const activeMatchingVector = Array.pad(
            [activeMatchingVectorComponents.totalMET],
            16,
            0,
          );

          yield* db
            .insert(matchingUserGeneralAssessment)
            .values({
              userId,
              assessmentVersion: 1,
              assessment: userGeneralAssessment,
            })
            .onConflictDoUpdate({
              target: [
                matchingUserGeneralAssessment.userId,
                matchingUserGeneralAssessment.assessmentVersion,
              ],
              set: {
                assessment: userGeneralAssessment,
              },
            })
            .returning({ id: matchingUserGeneralAssessment.id });

          const query = db
            .insert(matchingUserAssessmentVector)
            .values({
              userId,
              vectorVersion: Array.pad([1, 1, 1, 1], 16, 0),
              passiveMatchingVector: [
                ...passiveMatchingVector,
                ...Array.replicate(0, 240),
              ],
              activeMatchingVector: [
                ...activeMatchingVector,
                ...Array.replicate(0, 240),
              ],
            })
            .onConflictDoUpdate({
              target: [
                matchingUserAssessmentVector.userId,
                matchingUserAssessmentVector.vectorVersion,
              ],
              set: {
                passiveMatchingVector: sql`
                    '${JSON.stringify(passiveMatchingVector)}'::vector || 
                    subvector(${matchingUserAssessmentVector.passiveMatchingVector}, 17, 240)
                  `,
                activeMatchingVector: sql`
                    '${JSON.stringify(activeMatchingVector)}'::vector || 
                    subvector(${matchingUserAssessmentVector.activeMatchingVector}, 17, 240)
                  `,
              },
            });

          console.log(query.toSQL());

          yield* query;
        }).pipe(
          Effect.withSpan("assessmentDbRepositoryImpl.createGeneralAssessment"),
        ),
      createBadmintonV1Assessment: (userId, userBadmintonAssessment) =>
        Effect.gen(function* () {
          const {
            skillLevel,
            yearsOfExperience,
            playStyle,
            playFormat,
            playDuration,
          } = userBadmintonAssessment;
          const passiveMatchingVectorComponents = {
            skillLevel:
              4 * minMaxScaler({ minimum: 1, maximum: 5 })(skillLevel),
            yearsOfExperience:
              1 * minMaxScaler({ minimum: 0, maximum: 10 })(yearsOfExperience),
            offensive:
              playStyle === "offensive" || playStyle === "balanced" ? 1 : -1,
            defensive:
              playStyle === "defensive" || playStyle === "balanced" ? 1 : -1,
            singles:
              playFormat === "singles" || playFormat === "mixed" ? 1 : -1,
            doubles:
              playFormat === "doubles" || playFormat === "mixed" ? 1 : -1,
            playDuration:
              1 * minMaxScaler({ minimum: 0, maximum: 360 })(playDuration),
          };
          const activeMatchingVectorComponents = {
            skillLevel:
              4 * minMaxScaler({ minimum: 1, maximum: 5 })(skillLevel),
            yearsOfExperience:
              1 * minMaxScaler({ minimum: 0, maximum: 10 })(yearsOfExperience),
            offensive:
              playStyle === "offensive" || playStyle === "balanced" ? 1 : -1,
            defensive:
              playStyle === "defensive" || playStyle === "balanced" ? 1 : -1,
            singles:
              playFormat === "singles" || playFormat === "mixed" ? 1 : -1,
            doubles:
              playFormat === "doubles" || playFormat === "mixed" ? 1 : -1,
            playDuration:
              1 * minMaxScaler({ minimum: 0, maximum: 360 })(playDuration),
          };

          const passiveMatchingVector = Array.pad(
            [
              passiveMatchingVectorComponents.skillLevel,
              passiveMatchingVectorComponents.yearsOfExperience,
              passiveMatchingVectorComponents.offensive,
              passiveMatchingVectorComponents.defensive,
              passiveMatchingVectorComponents.singles,
              passiveMatchingVectorComponents.doubles,
              passiveMatchingVectorComponents.playDuration,
            ],
            16,
            0,
          );
          const activeMatchingVector = Array.pad(
            [
              activeMatchingVectorComponents.skillLevel,
              activeMatchingVectorComponents.yearsOfExperience,
              activeMatchingVectorComponents.offensive,
              activeMatchingVectorComponents.defensive,
              activeMatchingVectorComponents.singles,
              activeMatchingVectorComponents.doubles,
              activeMatchingVectorComponents.playDuration,
            ],
            16,
            0,
          );

          yield* db
            .insert(matchingUserBadmintonAssessment)
            .values({
              userId,
              assessmentVersion: 1,
              assessment: userBadmintonAssessment,
            })
            .onConflictDoUpdate({
              target: [
                matchingUserBadmintonAssessment.userId,
                matchingUserBadmintonAssessment.assessmentVersion,
              ],
              set: {
                assessment: userBadmintonAssessment,
              },
            });

          yield* db
            .insert(matchingUserAssessmentVector)
            .values({
              userId,
              vectorVersion: Array.pad([1, 1, 1, 1], 16, 0),
              passiveMatchingVector: [
                ...Array.replicate(0, 16),
                ...passiveMatchingVector,
                ...Array.replicate(0, 224),
              ],
              activeMatchingVector: [
                ...Array.replicate(0, 16),
                ...activeMatchingVector,
                ...Array.replicate(0, 224),
              ],
            })
            .onConflictDoUpdate({
              target: [
                matchingUserAssessmentVector.userId,
                matchingUserAssessmentVector.vectorVersion,
              ],
              set: {
                passiveMatchingVector: sql`
                    subvector(${matchingUserAssessmentVector.passiveMatchingVector}, 1, 16) || 
                    '${JSON.stringify(passiveMatchingVector)}'::vector || 
                    subvector(${matchingUserAssessmentVector.passiveMatchingVector}, 33, 224)
                  `,
                activeMatchingVector: sql`
                    subvector(${matchingUserAssessmentVector.activeMatchingVector}, 1, 16) || 
                    '${JSON.stringify(activeMatchingVector)}'::vector || 
                    subvector(${matchingUserAssessmentVector.activeMatchingVector}, 33, 224)
                  `,
              },
            });
        }).pipe(
          Effect.withSpan(
            "assessmentDbRepositoryImpl.createBadmintonAssessment",
          ),
        ),
      createTennisV1Assessment: (userId, userTennisAssessment) =>
        Effect.gen(function* () {
          const {
            skillLevel,
            yearsOfExperience,
            strokeStyle,
            playFormat,
            playDuration,
          } = userTennisAssessment;
          const passiveMatchingVectorComponents = {
            skillLevel:
              4 * minMaxScaler({ minimum: 1, maximum: 5 })(skillLevel),
            yearsOfExperience:
              1 * minMaxScaler({ minimum: 0, maximum: 10 })(yearsOfExperience),
            forehand: strokeStyle === "forehand" ? 1 : -1,
            backhand: strokeStyle === "backhand" ? 1 : -1,
            volley: strokeStyle === "volley" ? 1 : -1,
            serve: strokeStyle === "serve" ? 1 : -1,
            singles:
              playFormat === "singles" || playFormat === "mixed" ? 1 : -1,
            doubles:
              playFormat === "doubles" || playFormat === "mixed" ? 1 : -1,
            playDuration:
              1 * minMaxScaler({ minimum: 0, maximum: 360 })(playDuration),
          };
          const activeMatchingVectorComponents = {
            skillLevel:
              4 * minMaxScaler({ minimum: 1, maximum: 5 })(skillLevel),
            yearsOfExperience:
              1 * minMaxScaler({ minimum: 0, maximum: 10 })(yearsOfExperience),
            forehand: strokeStyle === "forehand" ? 1 : -1,
            backhand: strokeStyle === "backhand" ? 1 : -1,
            volley: strokeStyle === "volley" ? 1 : -1,
            serve: strokeStyle === "serve" ? 1 : -1,
            singles:
              playFormat === "singles" || playFormat === "mixed" ? 1 : -1,
            doubles:
              playFormat === "doubles" || playFormat === "mixed" ? 1 : -1,
            playDuration:
              1 * minMaxScaler({ minimum: 0, maximum: 360 })(playDuration),
          };

          const passiveMatchingVector = Array.pad(
            [
              passiveMatchingVectorComponents.skillLevel,
              passiveMatchingVectorComponents.yearsOfExperience,
              passiveMatchingVectorComponents.forehand,
              passiveMatchingVectorComponents.backhand,
              passiveMatchingVectorComponents.volley,
              passiveMatchingVectorComponents.serve,
              passiveMatchingVectorComponents.singles,
              passiveMatchingVectorComponents.doubles,
              passiveMatchingVectorComponents.playDuration,
            ],
            16,
            0,
          );
          const activeMatchingVector = Array.pad(
            [
              activeMatchingVectorComponents.skillLevel,
              activeMatchingVectorComponents.yearsOfExperience,
              activeMatchingVectorComponents.forehand,
              activeMatchingVectorComponents.backhand,
              activeMatchingVectorComponents.volley,
              activeMatchingVectorComponents.serve,
              activeMatchingVectorComponents.singles,
              activeMatchingVectorComponents.doubles,
              activeMatchingVectorComponents.playDuration,
            ],
            16,
            0,
          );

          yield* db
            .insert(matchingUserTennisAssessment)
            .values({
              userId,
              assessmentVersion: 1,
              assessment: userTennisAssessment,
            })
            .onConflictDoUpdate({
              target: [
                matchingUserTennisAssessment.userId,
                matchingUserTennisAssessment.assessmentVersion,
              ],
              set: {
                assessment: userTennisAssessment,
              },
            });

          yield* db
            .insert(matchingUserAssessmentVector)
            .values({
              userId,
              vectorVersion: Array.pad([1, 1, 1, 1], 16, 0),
              passiveMatchingVector: [
                ...Array.replicate(0, 32),
                ...passiveMatchingVector,
                ...Array.replicate(0, 208),
              ],
              activeMatchingVector: [
                ...Array.replicate(0, 32),
                ...activeMatchingVector,
                ...Array.replicate(0, 208),
              ],
            })
            .onConflictDoUpdate({
              target: [
                matchingUserAssessmentVector.userId,
                matchingUserAssessmentVector.vectorVersion,
              ],
              set: {
                passiveMatchingVector: sql`
                    subvector(${matchingUserAssessmentVector.passiveMatchingVector}, 1, 32) || 
                    '${JSON.stringify(passiveMatchingVector)}'::vector || 
                    subvector(${matchingUserAssessmentVector.passiveMatchingVector}, 49, 208)
                  `,
                activeMatchingVector: sql`
                    subvector(${matchingUserAssessmentVector.activeMatchingVector}, 1, 32) || 
                    '${JSON.stringify(activeMatchingVector)}'::vector || 
                    subvector(${matchingUserAssessmentVector.activeMatchingVector}, 49, 208)
                  `,
              },
            });
        }).pipe(
          Effect.withSpan("assessmentDbRepositoryImpl.createTennisAssessment"),
        ),
      createRunningV1Assessment: (userId, userRunningAssessment) =>
        Effect.gen(function* () {
          const {
            distance,
            pace,
            frequency,
            goal,
            bestPerformance: {
              distance: bestPerformanceDistance,
              time: bestPerformanceTime,
            },
          } = userRunningAssessment;
          const passiveMatchingVectorComponents = {
            distance: 1 * minMaxScaler({ minimum: 0, maximum: 42 })(distance),
            pace: 1 * minMaxScaler({ minimum: 4, maximum: 10 })(pace),
            frequency: 1 * minMaxScaler({ minimum: 0, maximum: 7 })(frequency),
            casual: goal.includes("casual") ? 1 : -1,
            raceTraining: goal.includes("race_training") ? 1 : -1,
            speedTraining: goal.includes("speed_training") ? 1 : -1,
            social: goal.includes("social") ? 1 : -1,
            bestPerformanceModifier:
              1 *
              minMaxScaler({ minimum: 0, maximum: 12 })(
                Math.pow(bestPerformanceDistance, 2) / bestPerformanceTime,
              ),
          };
          const activeMatchingVectorComponents = {
            distance: 1 * minMaxScaler({ minimum: 0, maximum: 42 })(distance),
            pace: 1 * minMaxScaler({ minimum: 4, maximum: 10 })(pace),
            frequency: 1 * minMaxScaler({ minimum: 0, maximum: 7 })(frequency),
            casual: goal.includes("casual") ? 1 : -1,
            raceTraining: goal.includes("race_training") ? 1 : -1,
            speedTraining: goal.includes("speed_training") ? 1 : -1,
            social: goal.includes("social") ? 1 : -1,
            bestPerformanceModifier:
              1 *
              minMaxScaler({ minimum: 0, maximum: 12 })(
                Math.pow(bestPerformanceDistance, 2) / bestPerformanceTime,
              ),
          };

          const passiveMatchingVector = Array.pad(
            [
              passiveMatchingVectorComponents.distance,
              passiveMatchingVectorComponents.pace,
              passiveMatchingVectorComponents.frequency,
              passiveMatchingVectorComponents.casual,
              passiveMatchingVectorComponents.raceTraining,
              passiveMatchingVectorComponents.speedTraining,
              passiveMatchingVectorComponents.social,
              passiveMatchingVectorComponents.bestPerformanceModifier,
            ],
            16,
            0,
          );
          const activeMatchingVector = Array.pad(
            [
              activeMatchingVectorComponents.distance,
              activeMatchingVectorComponents.pace,
              activeMatchingVectorComponents.frequency,
              activeMatchingVectorComponents.casual,
              activeMatchingVectorComponents.raceTraining,
              activeMatchingVectorComponents.speedTraining,
              activeMatchingVectorComponents.social,
              activeMatchingVectorComponents.bestPerformanceModifier,
            ],
            16,
            0,
          );

          yield* db
            .insert(matchingUserRunningAssessment)
            .values({
              userId,
              assessmentVersion: 1,
              assessment: userRunningAssessment,
            })
            .onConflictDoUpdate({
              target: [
                matchingUserRunningAssessment.userId,
                matchingUserRunningAssessment.assessmentVersion,
              ],
              set: {
                assessment: userRunningAssessment,
              },
            });

          yield* db
            .insert(matchingUserAssessmentVector)
            .values({
              userId,
              vectorVersion: Array.pad([1, 1, 1, 1], 16, 0),
              passiveMatchingVector: [
                ...Array.replicate(0, 48),
                ...passiveMatchingVector,
                ...Array.replicate(0, 192),
              ],
              activeMatchingVector: [
                ...Array.replicate(0, 48),
                ...activeMatchingVector,
                ...Array.replicate(0, 192),
              ],
            })
            .onConflictDoUpdate({
              target: [
                matchingUserAssessmentVector.userId,
                matchingUserAssessmentVector.vectorVersion,
              ],
              set: {
                passiveMatchingVector: sql`
                  subvector(${matchingUserAssessmentVector.passiveMatchingVector}, 1, 48) || 
                  '${JSON.stringify(passiveMatchingVector)}'::vector || 
                  subvector(${matchingUserAssessmentVector.passiveMatchingVector}, 65, 192)
                `,
                activeMatchingVector: sql`
                  subvector(${matchingUserAssessmentVector.activeMatchingVector}, 1, 48) || 
                  '${JSON.stringify(activeMatchingVector)}'::vector || 
                  subvector(${matchingUserAssessmentVector.activeMatchingVector}, 65, 192)
                `,
              },
            });
        }).pipe(
          Effect.withSpan("assessmentDbRepositoryImpl.createRunningAssessment"),
        ),
      getGeneralAssessmentV1Performed: (userId) =>
        Effect.gen(function* () {
          const rows = yield* db
            .select({ assessment: matchingUserGeneralAssessment.assessment })
            .from(matchingUserGeneralAssessment)
            .where(
              and(
                eq(matchingUserGeneralAssessment.userId, userId),
                eq(matchingUserGeneralAssessment.assessmentVersion, 1),
                isNull(matchingUserGeneralAssessment.deletedAt),
              ),
            );

          return yield* pipe(
            Stream.fromIterable(rows),
            Stream.mapEffect(({ assessment }) =>
              pipe(
                effectType(generalAssessmentSchemas[1], assessment),
                Effect.option,
              ),
            ),
            Stream.filter(Option.isSome),
            Stream.map(({ value }) => value),
            Stream.runCollect,
            Effect.map(Chunk.toReadonlyArray),
          );
        }),
      getBadmintonAssessmentV1Performed: (userId) =>
        Effect.gen(function* () {
          const rows = yield* db
            .select({ assessment: matchingUserBadmintonAssessment.assessment })
            .from(matchingUserBadmintonAssessment)
            .where(
              and(
                eq(matchingUserBadmintonAssessment.userId, userId),
                eq(matchingUserBadmintonAssessment.assessmentVersion, 1),
                isNull(matchingUserBadmintonAssessment.deletedAt),
              ),
            );

          return yield* pipe(
            Stream.fromIterable(rows),
            Stream.mapEffect(({ assessment }) =>
              pipe(
                effectType(badmintonAssessmentSchemas[1], assessment),
                Effect.option,
              ),
            ),
            Stream.filter(Option.isSome),
            Stream.map(({ value }) => value),
            Stream.runCollect,
            Effect.map(Chunk.toReadonlyArray),
          );
        }),
      getTennisAssessmentV1Performed: (userId) =>
        Effect.gen(function* () {
          const rows = yield* db
            .select({ assessment: matchingUserTennisAssessment.assessment })
            .from(matchingUserTennisAssessment)
            .where(
              and(
                eq(matchingUserTennisAssessment.userId, userId),
                eq(matchingUserTennisAssessment.assessmentVersion, 1),
                isNull(matchingUserTennisAssessment.deletedAt),
              ),
            );

          return yield* pipe(
            Stream.fromIterable(rows),
            Stream.mapEffect(({ assessment }) =>
              pipe(
                effectType(tennisAssessmentSchemas[1], assessment),
                Effect.option,
              ),
            ),
            Stream.filter(Option.isSome),
            Stream.map(({ value }) => value),
            Stream.runCollect,
            Effect.map(Chunk.toReadonlyArray),
          );
        }),
      getRunningAssessmentV1Performed: (userId) =>
        Effect.gen(function* () {
          const rows = yield* db
            .select({ assessment: matchingUserRunningAssessment.assessment })
            .from(matchingUserRunningAssessment)
            .where(
              and(
                eq(matchingUserRunningAssessment.userId, userId),
                eq(matchingUserRunningAssessment.assessmentVersion, 1),
                isNull(matchingUserRunningAssessment.deletedAt),
              ),
            );

          return yield* pipe(
            Stream.fromIterable(rows),
            Stream.mapEffect(({ assessment }) =>
              pipe(
                effectType(runningAssessmentSchemas[1], assessment),
                Effect.option,
              ),
            ),
            Stream.filter(Option.isSome),
            Stream.map(({ value }) => value),
            Stream.runCollect,
            Effect.map(Chunk.toReadonlyArray),
          );
        }),
    });
  }),
);
