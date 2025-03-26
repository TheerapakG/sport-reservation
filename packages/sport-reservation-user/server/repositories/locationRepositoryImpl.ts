import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import {
  userLocation,
  userUserProfileLocation,
} from "sport-reservation-db/schema";
import { LocationRepository } from "./locationRepository";

export const locationRepositoryImpl = /*@__PURE__*/ Layer.effect(
  LocationRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;
    return LocationRepository.of({
      createLocation: (data) =>
        Effect.gen(function* () {
          const users = yield* db
            .insert(userLocation)
            .values(data)
            .onConflictDoNothing()
            .returning();
          if (users.length === 0) return Option.none();
          return Option.some(users[0]);
        }).pipe(Effect.withSpan("locationRepositoryImpl.createLocation")),
      updateLocation: ({ publicId, ...data }) =>
        Effect.gen(function* () {
          const users = yield* db
            .update(userLocation)
            .set(data)
            .where(
              and(
                isNull(userLocation.deletedAt),
                eq(userLocation.publicId, publicId),
              ),
            )
            .returning();
          if (users.length === 0) return Option.none();
          return Option.some(users[0]);
        }).pipe(Effect.withSpan("locationRepositoryImpl.updateLocation")),
      findLocationById: ({ publicId }) =>
        Effect.gen(function* () {
          const users = yield* db
            .select()
            .from(userLocation)
            .where(
              and(
                isNull(userLocation.deletedAt),
                eq(userLocation.publicId, publicId),
              ),
            )
            .limit(1);
          if (users.length === 0) return Option.none();
          return Option.some(users[0]);
        }).pipe(Effect.withSpan("locationRepositoryImpl.findLocationById")),
      deleteLocation: ({ publicId }) =>
        Effect.gen(function* () {
          yield* db
            .update(userLocation)
            .set({ deletedAt: new Date() })
            .where(eq(userLocation.publicId, publicId));
        }).pipe(Effect.withSpan("locationRepositoryImpl.deleteLocation")),
      associateLocationWithUser: ({ userId, locationId }) =>
        Effect.gen(function* () {
          yield* db
            .insert(userUserProfileLocation)
            .values({ userId, locationId });
        }).pipe(
          Effect.withSpan("locationRepositoryImpl.associateLocationWithUser"),
        ),
      dissociateLocationFromUser: ({ userId, locationId }) =>
        Effect.gen(function* () {
          yield* db
            .update(userUserProfileLocation)
            .set({ deletedAt: new Date() })
            .where(
              and(
                eq(userUserProfileLocation.userId, userId),
                eq(userUserProfileLocation.locationId, locationId),
              ),
            );
        }).pipe(
          Effect.withSpan("locationRepositoryImpl.dissociateLocationFromUser"),
        ),
      getLocationsByUserId: ({ userId }) =>
        Effect.gen(function* () {
          const locations = yield* db
            .select({
              location: userLocation,
            })
            .from(userUserProfileLocation)
            .innerJoin(
              userLocation,
              eq(userUserProfileLocation.locationId, userLocation.publicId),
            )
            .where(
              and(
                isNull(userUserProfileLocation.deletedAt),
                eq(userUserProfileLocation.userId, userId),
              ),
            );
          return locations;
        }).pipe(Effect.withSpan("locationRepositoryImpl.getLocationsByUserId")),
    });
  }),
);
