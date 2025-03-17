import { SqlError } from "@effect/sql";
import { Context, Effect } from "effect";
import {
  badmintonAssessmentSchema,
  generalAssessmentSchema,
  runningAssessmentSchema,
  tennisAssessmentSchema,
} from "~/models/assessment";

export class AssessmentDbRepository
  extends /*@__PURE__*/ Context.Tag("AssessmentDbRepository")<
    AssessmentDbRepository,
    {
      createGeneralAssessment: (
        userId: string,
        assessment: typeof generalAssessmentSchema.infer,
      ) => Effect.Effect<void, SqlError.SqlError>;
      createBadmintonAssessment: (
        userId: string,
        assessment: typeof badmintonAssessmentSchema.infer,
      ) => Effect.Effect<void, SqlError.SqlError>;
      createTennisAssessment: (
        userId: string,
        assessment: typeof tennisAssessmentSchema.infer,
      ) => Effect.Effect<void, SqlError.SqlError>;
      createRunningAssessment: (
        userId: string,
        assessment: typeof runningAssessmentSchema.infer,
      ) => Effect.Effect<void, SqlError.SqlError>;
    }
  >() {}
