import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";

export class PlatformLoginDbRepository
  extends /*@__PURE__*/ Context.Tag("PlatformLoginDbRepository")<
    PlatformLoginDbRepository,
    {
      findUserIdByPlatformId: (data: {
        platformId: string;
      }) => Effect.Effect<Option.Option<{ userId: string }>, SqlError.SqlError>;
      associateUserIdWithPlatformId: (data: {
        userId: string;
        platformId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
    }
  >() {}
