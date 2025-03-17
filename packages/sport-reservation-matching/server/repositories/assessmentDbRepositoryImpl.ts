import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { Array, Effect, Layer, Number } from "effect";
import {
  matchingUserBadmintonAssessment,
  matchingUserBadmintonAssessmentVector,
  matchingUserGeneralAssessment,
  matchingUserGeneralAssessmentVector,
  matchingUserRunningAssessment,
  matchingUserRunningAssessmentVector,
  matchingUserTennisAssessment,
  matchingUserTennisAssessmentVector,
} from "sport-reservation-db/schema";
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

          yield* db
            .insert(matchingUserGeneralAssessment)
            .values({
              userId,
              assessmentVersion: 1,
              assessment: userGeneralAssessment,
            })
            .returning({ id: matchingUserGeneralAssessment.id });

          yield* db.insert(matchingUserGeneralAssessmentVector).values({
            userId,
            vectorVersion: 1,
            passiveMatchingVector: Array.pad(
              [passiveMatchingVectorComponents.totalMET],
              64,
              0,
            ),
            activeMatchingVector: Array.pad(
              [activeMatchingVectorComponents.totalMET],
              64,
              0,
            ),
          });
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

          yield* db
            .insert(matchingUserBadmintonAssessment)
            .values({
              userId,
              assessmentVersion: 1,
              assessment: userBadmintonAssessment,
            })
            .returning({ id: matchingUserBadmintonAssessment.id });

          yield* db.insert(matchingUserBadmintonAssessmentVector).values({
            userId,
            vectorVersion: 1,
            passiveMatchingVector: Array.pad(
              [
                passiveMatchingVectorComponents.skillLevel,
                passiveMatchingVectorComponents.yearsOfExperience,
                passiveMatchingVectorComponents.offensive,
                passiveMatchingVectorComponents.defensive,
                passiveMatchingVectorComponents.singles,
                passiveMatchingVectorComponents.doubles,
                passiveMatchingVectorComponents.playDuration,
              ],
              64,
              0,
            ),
            activeMatchingVector: Array.pad(
              [
                activeMatchingVectorComponents.skillLevel,
                activeMatchingVectorComponents.yearsOfExperience,
                activeMatchingVectorComponents.offensive,
                activeMatchingVectorComponents.defensive,
                activeMatchingVectorComponents.singles,
                activeMatchingVectorComponents.doubles,
                activeMatchingVectorComponents.playDuration,
              ],
              64,
              0,
            ),
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

          yield* db
            .insert(matchingUserTennisAssessment)
            .values({
              userId,
              assessmentVersion: 1,
              assessment: userTennisAssessment,
            })
            .returning({ id: matchingUserTennisAssessment.id });

          yield* db.insert(matchingUserTennisAssessmentVector).values({
            userId,
            vectorVersion: 1,
            passiveMatchingVector: Array.pad(
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
              64,
              0,
            ),
            activeMatchingVector: Array.pad(
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
              64,
              0,
            ),
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

          yield* db
            .insert(matchingUserRunningAssessment)
            .values({
              userId,
              assessmentVersion: 1,
              assessment: userRunningAssessment,
            })
            .returning({ id: matchingUserRunningAssessment.id });

          yield* db.insert(matchingUserRunningAssessmentVector).values({
            userId,
            vectorVersion: 1,
            passiveMatchingVector: Array.pad(
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
              64,
              0,
            ),
            activeMatchingVector: Array.pad(
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
              64,
              0,
            ),
          });
        }).pipe(
          Effect.withSpan("assessmentDbRepositoryImpl.createRunningAssessment"),
        ),
    });
  }),
);
