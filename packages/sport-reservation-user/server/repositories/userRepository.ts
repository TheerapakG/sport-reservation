import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import { Simplify } from "effect/Types";
import { userUserProfile } from "sport-reservation-db/schema";

export class UserRepository
  extends /*@__PURE__*/ Context.Tag("UserRepository")<
    UserRepository,
    {
      createUserProfile: (
        data: Simplify<
          Omit<typeof userUserProfile.$inferInsert, "id" | "publicId">
        >,
      ) => Effect.Effect<
        Option.Option<typeof userUserProfile.$inferSelect>,
        SqlError.SqlError
      >;
      updateUserProfile: (
        data: Simplify<
          Omit<typeof userUserProfile.$inferInsert, "id" | "publicId"> &
            Required<Pick<typeof userUserProfile.$inferInsert, "publicId">>
        >,
      ) => Effect.Effect<
        Option.Option<typeof userUserProfile.$inferSelect>,
        SqlError.SqlError
      >;
      findUserProfileByIds: (data: {
        publicIds: string[];
      }) => Effect.Effect<
        Option.Option<typeof userUserProfile.$inferSelect>[],
        SqlError.SqlError
      >;
      deleteUserProfile: (data: {
        publicId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
    }
  >() {}
