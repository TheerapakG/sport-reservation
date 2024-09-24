import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import { Simplify } from "effect/Types";
import { userUserProfile } from "sport-reservation-common/db/schema";

export class UserRepository
  extends /*@__PURE__*/ Context.Tag("UserRepository")<
    UserRepository,
    {
      createUserProfile: (
        data: Simplify<Omit<typeof userUserProfile.$inferInsert, "id">>,
      ) => Effect.Effect<
        Option.Option<typeof userUserProfile.$inferSelect>,
        SqlError.SqlError
      >;
      updateUserProfile: (
        data: Simplify<
          Omit<typeof userUserProfile.$inferInsert, "id"> &
            Required<Pick<typeof userUserProfile.$inferInsert, "id">>
        >,
      ) => Effect.Effect<
        Option.Option<typeof userUserProfile.$inferSelect>,
        SqlError.SqlError
      >;
      findUserProfileById: (data: {
        id: number;
      }) => Effect.Effect<
        Option.Option<typeof userUserProfile.$inferSelect>,
        SqlError.SqlError
      >;
    }
  >() {}
