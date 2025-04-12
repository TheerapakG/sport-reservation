import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import { authUserLineConnection } from "sport-reservation-db/schema";
import { LineLoginDbRepository } from "./lineLoginDbRepository";

export const lineLoginDbRepositoryImpl = /*@__PURE__*/ Layer.effect(
  LineLoginDbRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;

    return LineLoginDbRepository.of({
      findUserIdByPlatformId: ({ platformId }) =>
        Effect.gen(function* () {
          const users = yield* db
            .select()
            .from(authUserLineConnection)
            .where(
              and(
                isNull(authUserLineConnection.deletedAt),
                eq(authUserLineConnection.lineId, platformId),
              ),
            )
            .limit(1);

          if (users.length === 0) return Option.none();

          return Option.some({ userId: users[0].userId });
        }).pipe(
          Effect.withSpan("lineLoginDbRepositoryImpl.findUserIdByPlatformId"),
        ),
      associateUserIdWithPlatformId: ({ userId, platformId }) =>
        Effect.gen(function* () {
          yield* db
            .insert(authUserLineConnection)
            .values({ userId, lineId: platformId })
            .onConflictDoUpdate({
              target: authUserLineConnection.lineId,
              set: { userId },
              setWhere: eq(authUserLineConnection.lineId, platformId),
            });
        }).pipe(
          Effect.withSpan(
            "lineLoginDbRepositoryImpl.associateUserIdWithPlatformId",
          ),
        ),
    });
  }),
);
