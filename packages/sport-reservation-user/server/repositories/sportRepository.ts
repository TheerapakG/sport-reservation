import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import { Simplify } from "effect/Types";
import { userSport } from "sport-reservation-db/schema";

export class SportRepository
  extends /*@__PURE__*/ Context.Tag("SportRepository")<
    SportRepository,
    {
      createSport: (
        data: Simplify<Omit<typeof userSport.$inferInsert, "id" | "publicId">>,
      ) => Effect.Effect<
        Option.Option<typeof userSport.$inferSelect>,
        SqlError.SqlError
      >;
      updateSport: (
        data: Simplify<
          Omit<typeof userSport.$inferInsert, "id" | "publicId"> &
            Required<Pick<typeof userSport.$inferInsert, "publicId">>
        >,
      ) => Effect.Effect<
        Option.Option<typeof userSport.$inferSelect>,
        SqlError.SqlError
      >;
      findSportById: (data: {
        publicId: string;
      }) => Effect.Effect<
        Option.Option<typeof userSport.$inferSelect>,
        SqlError.SqlError
      >;
      deleteSport: (data: {
        publicId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      associateSportWithUser: (data: {
        userId: string;
        sportId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      dissociateSportFromUser: (data: {
        userId: string;
        sportId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      getSportsByUserId: (data: { userId: string }) => Effect.Effect<
        {
          sport: typeof userSport.$inferSelect;
        }[],
        SqlError.SqlError
      >;
    }
  >() {}
