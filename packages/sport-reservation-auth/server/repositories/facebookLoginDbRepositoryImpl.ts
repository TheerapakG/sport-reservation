import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import { authUserFacebookConnection } from "sport-reservation-db/schema";
import { FacebookLoginDbRepository } from "./facebookLoginDbRepository";

export const facebookLoginDbRepositoryImpl = /*@__PURE__*/ Layer.effect(
  FacebookLoginDbRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;

    return FacebookLoginDbRepository.of({
      findUserIdByPlatformId: ({ platformId }) =>
        Effect.gen(function* () {
          const users = yield* db
            .select()
            .from(authUserFacebookConnection)
            .where(
              and(
                isNull(authUserFacebookConnection.deletedAt),
                eq(authUserFacebookConnection.facebookId, platformId),
              ),
            )
            .limit(1);

          if (users.length === 0) return Option.none();

          return Option.some({ userId: users[0].userId });
        }).pipe(
          Effect.withSpan(
            "facebookLoginDbRepositoryImpl.findUserIdByPlatformId",
          ),
        ),
      associateUserIdWithPlatformId: ({ userId, platformId }) =>
        Effect.gen(function* () {
          yield* db
            .insert(authUserFacebookConnection)
            .values({ userId, facebookId: platformId })
            .onConflictDoUpdate({
              target: authUserFacebookConnection.facebookId,
              set: { userId },
              setWhere: eq(authUserFacebookConnection.facebookId, platformId),
            });
        }).pipe(
          Effect.withSpan(
            "facebookLoginDbRepositoryImpl.associateUserIdWithPlatformId",
          ),
        ),
    });
  }),
);
