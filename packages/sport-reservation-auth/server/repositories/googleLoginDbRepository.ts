import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";

export class GoogleLoginDbRepository
  extends /*@__PURE__*/ Context.Tag("GoogleLoginDbRepository")<
    GoogleLoginDbRepository,
    {
      findUserIdByGoogleId: (data: {
        googleId: string;
      }) => Effect.Effect<Option.Option<{ userId: string }>, SqlError.SqlError>;
      associateUserIdWithGoogleId: (data: {
        userId: string;
        googleId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
    }
  >() {}
