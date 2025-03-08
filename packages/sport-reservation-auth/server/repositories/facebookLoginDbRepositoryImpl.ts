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
      findUserIdByFacebookId: ({ facebookId }) =>
        Effect.gen(function* () {
          const users = yield* db
            .select()
            .from(authUserFacebookConnection)
            .where(
              and(
                isNull(authUserFacebookConnection.deletedAt),
                eq(authUserFacebookConnection.facebookId, facebookId),
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
            .insert(authUserFacebookConnection)
            .values({ userId, facebookId })
            .onConflictDoUpdate({
              target: authUserFacebookConnection.userId,
              set: { facebookId },
              setWhere: eq(authUserFacebookConnection.userId, userId),
            });
        }).pipe(
          Effect.withSpan(
            "facebookLoginDbRepositoryImpl.associateUserIdWithFacebookId",
          ),
        ),
    });
  }),
);
