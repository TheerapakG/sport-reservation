import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Context, Effect, Layer, Option } from "effect";
import { authUserAuthConnection } from "sport-reservation-db/schema";
import { FacebookLoginDbRepository } from "./facebookLoginDbRepository";

export const facebookLoginDbRepositoryImpl = /*@__PURE__*/ Layer.effect(
  FacebookLoginDbRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;

    return <Context.Tag.Service<FacebookLoginDbRepository>>{
      findUserIdByFacebookId: ({ facebookId }) =>
        Effect.gen(function* () {
          const users = yield* db
            .select()
            .from(authUserAuthConnection)
            .where(
              and(
                isNull(authUserAuthConnection.deletedAt),
                eq(authUserAuthConnection.facebookId, facebookId),
              ),
            )
            .limit(1);

          if (users.length === 0) return Option.none();

          return Option.some({ userId: users[0].userId });
        }).pipe(
          Effect.withSpan(
            "facebookLoginDbRepositoryImpl.findUserIdByFacebookId",
          ),
        ),
      associateUserIdWithFacebookId: ({ userId, facebookId }) =>
        Effect.gen(function* () {
          yield* db
            .insert(authUserAuthConnection)
            .values({ userId, facebookId })
            .onConflictDoUpdate({
              target: authUserAuthConnection.userId,
              set: { facebookId },
              setWhere: eq(authUserAuthConnection.userId, userId),
            });
        }).pipe(
          Effect.withSpan(
            "facebookLoginDbRepositoryImpl.associateUserIdWithFacebookId",
          ),
        ),
    };
  }),
);
