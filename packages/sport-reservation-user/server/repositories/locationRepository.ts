import { SqlError } from "@effect/sql";
import { Context, Effect, Option } from "effect";
import { Simplify } from "effect/Types";
import { userLocation } from "sport-reservation-db/schema";

export class LocationRepository
  extends /*@__PURE__*/ Context.Tag("LocationRepository")<
    LocationRepository,
    {
      createLocation: (
        data: Simplify<
          Omit<typeof userLocation.$inferInsert, "id" | "publicId">
        >,
      ) => Effect.Effect<
        Option.Option<typeof userLocation.$inferSelect>,
        SqlError.SqlError
      >;
      updateLocation: (
        data: Simplify<
          Omit<typeof userLocation.$inferInsert, "id" | "publicId"> &
            Required<Pick<typeof userLocation.$inferInsert, "publicId">>
        >,
      ) => Effect.Effect<
        Option.Option<typeof userLocation.$inferSelect>,
        SqlError.SqlError
      >;
      findLocationById: (data: {
        publicId: string;
      }) => Effect.Effect<
        Option.Option<typeof userLocation.$inferSelect>,
        SqlError.SqlError
      >;
      deleteLocation: (data: {
        publicId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      associateLocationWithUser: (data: {
        userId: string;
        locationId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      dissociateLocationFromUser: (data: {
        userId: string;
        locationId: string;
      }) => Effect.Effect<void, SqlError.SqlError>;
      getLocationsByUserId: (data: { userId: string }) => Effect.Effect<
        {
          location: typeof userLocation.$inferSelect;
        }[],
        SqlError.SqlError
      >;
    }
  >() {}
