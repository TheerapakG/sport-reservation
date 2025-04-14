import { SqlError } from "@effect/sql";
import { Context, Effect } from "effect";
import {
  badmintonAssessmentSchemas,
  generalAssessmentSchemas,
  runningAssessmentSchemas,
  tennisAssessmentSchemas,
} from "~/models/assessment";

export class AssessmentDbRepository
  extends /*@__PURE__*/ Context.Tag("AssessmentDbRepository")<
    AssessmentDbRepository,
    {
      createGeneralV1Assessment: (
        userId: string,
        assessment: (typeof generalAssessmentSchemas)[1]["infer"],
      ) => Effect.Effect<void, SqlError.SqlError>;
      createBadmintonV1Assessment: (
        userId: string,
        assessment: (typeof badmintonAssessmentSchemas)[1]["infer"],
      ) => Effect.Effect<void, SqlError.SqlError>;
      createTennisV1Assessment: (
        userId: string,
        assessment: (typeof tennisAssessmentSchemas)[1]["infer"],
      ) => Effect.Effect<void, SqlError.SqlError>;
      createRunningV1Assessment: (
        userId: string,
        assessment: (typeof runningAssessmentSchemas)[1]["infer"],
      ) => Effect.Effect<void, SqlError.SqlError>;
      getGeneralAssessmentV1Performed: (
        userId: string,
      ) => Effect.Effect<
        readonly (typeof generalAssessmentSchemas)[1]["infer"][],
        SqlError.SqlError
      >;
      getBadmintonAssessmentV1Performed: (
        userId: string,
      ) => Effect.Effect<
        readonly (typeof badmintonAssessmentSchemas)[1]["infer"][],
        SqlError.SqlError
      >;
      getTennisAssessmentV1Performed: (
        userId: string,
      ) => Effect.Effect<
        readonly (typeof tennisAssessmentSchemas)[1]["infer"][],
        SqlError.SqlError
      >;
      getRunningAssessmentV1Performed: (
        userId: string,
      ) => Effect.Effect<
        readonly (typeof runningAssessmentSchemas)[1]["infer"][],
        SqlError.SqlError
      >;
    }
  >() {}
