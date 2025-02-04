import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";

export class LineLoginDbRepository
  extends /*@__PURE__*/ Context.Tag("LineLoginDbRepository")<
    LineLoginDbRepository,
    {
      findUserIdByLineId: (data: {
        lineId: string;
      }) => Effect.Effect<Option.Option<{ userId: string }>, SqlError.SqlError>;
      associateUserIdWithLineId: (data: {
        userId: string;
        lineId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
    }
  >() {}
