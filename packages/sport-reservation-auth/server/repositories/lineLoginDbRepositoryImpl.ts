import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Context, Effect, Layer, Option } from "effect";
import { authUserLineConnection } from "sport-reservation-db/schema";
import { LineLoginDbRepository } from "./lineLoginDbRepository";

export const lineLoginDbRepositoryImpl = /*@__PURE__*/ Layer.effect(
  LineLoginDbRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;

    return <Context.Tag.Service<LineLoginDbRepository>>{
      findUserIdByLineId: ({ lineId }) =>
        Effect.gen(function* () {
          const users = yield* db
            .select()
            .from(authUserLineConnection)
            .where(
              and(
                isNull(authUserLineConnection.deletedAt),
                eq(authUserLineConnection.lineId, lineId),
              ),
            )
            .limit(1);

          if (users.length === 0) return Option.none();

          return Option.some({ userId: users[0].userId });
        }).pipe(
          Effect.withSpan("lineLoginDbRepositoryImpl.findUserIdByLineId"),
        ),
      associateUserIdWithLineId: ({ userId, lineId }) =>
        Effect.gen(function* () {
          yield* db
            .insert(authUserLineConnection)
            .values({ userId, lineId })
            .onConflictDoUpdate({
              target: authUserLineConnection.userId,
              set: { lineId },
              setWhere: eq(authUserLineConnection.userId, userId),
            });
        }).pipe(
          Effect.withSpan(
            "lineLoginDbRepositoryImpl.associateUserIdWithLineId",
          ),
        ),
    };
  }),
);
