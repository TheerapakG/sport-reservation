import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import { userSport, userUserProfileSport } from "sport-reservation-db/schema";
import { SportRepository } from "./sportRepository";

export const sportRepositoryImpl = /*@__PURE__*/ Layer.effect(
  SportRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;
    return SportRepository.of({
      createSport: (data) =>
        Effect.gen(function* () {
          const users = yield* db
            .insert(userSport)
            .values(data)
            .onConflictDoNothing()
            .returning();
          if (users.length === 0) return Option.none();
          return Option.some(users[0]);
        }).pipe(Effect.withSpan("sportRepositoryImpl.createSport")),
      updateSport: ({ publicId, ...data }) =>
        Effect.gen(function* () {
          const users = yield* db
            .update(userSport)
            .set(data)
            .where(
              and(
                isNull(userSport.deletedAt),
                eq(userSport.publicId, publicId),
              ),
            )
            .returning();
          if (users.length === 0) return Option.none();
          return Option.some(users[0]);
        }).pipe(Effect.withSpan("sportRepositoryImpl.updateSport")),
      findSportById: ({ publicId }) =>
        Effect.gen(function* () {
          const users = yield* db
            .select()
            .from(userSport)
            .where(
              and(
                isNull(userSport.deletedAt),
                eq(userSport.publicId, publicId),
              ),
            )
            .limit(1);
          if (users.length === 0) return Option.none();
          return Option.some(users[0]);
        }).pipe(Effect.withSpan("sportRepositoryImpl.findSportById")),
      deleteSport: ({ publicId }) =>
        Effect.gen(function* () {
          yield* db
            .update(userSport)
            .set({ deletedAt: new Date() })
            .where(eq(userSport.publicId, publicId));
        }).pipe(Effect.withSpan("sportRepositoryImpl.deleteSport")),
      associateSportWithUser: ({ userId, sportId }) =>
        Effect.gen(function* () {
          yield* db.insert(userUserProfileSport).values({ userId, sportId });
        }).pipe(Effect.withSpan("sportRepositoryImpl.associateSportWithUser")),
      dissociateSportFromUser: ({ userId, sportId }) =>
        Effect.gen(function* () {
          yield* db
            .update(userUserProfileSport)
            .set({ deletedAt: new Date() })
            .where(
              and(
                eq(userUserProfileSport.userId, userId),
                eq(userUserProfileSport.sportId, sportId),
              ),
            );
        }).pipe(Effect.withSpan("sportRepositoryImpl.dissociateSportFromUser")),
      getSportsByUserId: ({ userId }) =>
        Effect.gen(function* () {
          const sports = yield* db
            .select({
              sport: userSport,
            })
            .from(userUserProfileSport)
            .innerJoin(
              userSport,
              eq(userUserProfileSport.sportId, userSport.publicId),
            )
            .where(
              and(
                isNull(userUserProfileSport.deletedAt),
                eq(userUserProfileSport.userId, userId),
              ),
            );
          return sports;
        }).pipe(Effect.withSpan("sportRepositoryImpl.getSportsByUserId")),
    });
  }),
);
