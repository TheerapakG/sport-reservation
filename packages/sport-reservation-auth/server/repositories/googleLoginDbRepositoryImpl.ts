import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Context, Effect, Layer, Option } from "effect";
import { authUserAuthConnection } from "sport-reservation-db/schema";
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
            .from(authUserAuthConnection)
            .where(
              and(
                isNull(authUserAuthConnection.deletedAt),
                eq(authUserAuthConnection.googleId, googleId),
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
            .insert(authUserAuthConnection)
            .values({ userId, googleId })
            .onConflictDoUpdate({
              target: authUserAuthConnection.userId,
              set: { googleId },
              setWhere: eq(authUserAuthConnection.userId, userId),
            });
        }).pipe(
          Effect.withSpan(
            "googleLoginDbRepositoryImpl.associateUserIdWithGoogleId",
          ),
        ),
    };
  }),
);
