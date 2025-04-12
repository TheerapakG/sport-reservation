import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import { authUserGoogleConnection } from "sport-reservation-db/schema";
import { GoogleLoginDbRepository } from "./googleLoginDbRepository";

export const googleLoginDbRepositoryImpl = /*@__PURE__*/ Layer.effect(
  GoogleLoginDbRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;

    return GoogleLoginDbRepository.of({
      findUserIdByPlatformId: ({ platformId }) =>
        Effect.gen(function* () {
          const users = yield* db
            .select()
            .from(authUserGoogleConnection)
            .where(
              and(
                isNull(authUserGoogleConnection.deletedAt),
                eq(authUserGoogleConnection.googleId, platformId),
              ),
            )
            .limit(1);

          if (users.length === 0) return Option.none();

          return Option.some({ userId: users[0].userId });
        }).pipe(
          Effect.withSpan("googleLoginDbRepositoryImpl.findUserIdByPlatformId"),
        ),
      associateUserIdWithPlatformId: ({ userId, platformId }) =>
        Effect.gen(function* () {
          yield* db
            .insert(authUserGoogleConnection)
            .values({ userId, googleId: platformId })
            .onConflictDoUpdate({
              target: authUserGoogleConnection.googleId,
              set: { userId },
              setWhere: eq(authUserGoogleConnection.googleId, platformId),
            });
        }).pipe(
          Effect.withSpan(
            "googleLoginDbRepositoryImpl.associateUserIdWithPlatformId",
          ),
        ),
    });
  }),
);
