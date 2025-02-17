import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Context, Effect, Layer, Option } from "effect";
import { authUserGoogleConnection } from "sport-reservation-db/schema";
import { GoogleLoginDbRepository } from "./googleLoginDbRepository";

export const googleLoginDbRepositoryImpl = /*@__PURE__*/ Layer.effect(
  GoogleLoginDbRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;

    return <Context.Tag.Service<GoogleLoginDbRepository>>{
      findUserIdByGoogleId: ({ googleId }) =>
        Effect.gen(function* () {
          const users = yield* db
            .select()
            .from(authUserGoogleConnection)
            .where(
              and(
                isNull(authUserGoogleConnection.deletedAt),
                eq(authUserGoogleConnection.googleId, googleId),
              ),
            )
            .limit(1);

          if (users.length === 0) return Option.none();

          return Option.some({ userId: users[0].userId });
        }).pipe(
          Effect.withSpan("googleLoginDbRepositoryImpl.findUserIdByGoogleId"),
        ),
      associateUserIdWithGoogleId: ({ userId, googleId }) =>
        Effect.gen(function* () {
          yield* db
            .insert(authUserGoogleConnection)
            .values({ userId, googleId })
            .onConflictDoUpdate({
              target: authUserGoogleConnection.userId,
              set: { googleId },
              setWhere: eq(authUserGoogleConnection.userId, userId),
            });
        }).pipe(
          Effect.withSpan(
            "googleLoginDbRepositoryImpl.associateUserIdWithGoogleId",
          ),
        ),
    };
  }),
);
