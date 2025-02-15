import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";

export class FacebookLoginDbRepository
  extends /*@__PURE__*/ Context.Tag("FacebookLoginDbRepository")<
    FacebookLoginDbRepository,
    {
      findUserIdByFacebookId: (data: {
        facebookId: string;
      }) => Effect.Effect<Option.Option<{ userId: string }>, SqlError.SqlError>;
      associateUserIdWithFacebookId: (data: {
        userId: string;
        facebookId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
    }
  >() {}
