import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, eq, isNull } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import { chatChat } from "sport-reservation-db/schema";
import { ChatRepository } from "./chatRepository";

export const chatRepositoryImpl = /*@__PURE__*/ Layer.effect(
  ChatRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;
    return {
      getChat: (groupId) =>
        Effect.gen(function* () {
          const chats = yield* db
            .select()
            .from(chatChat)
            .where(
              and(isNull(chatChat.deletedAt), eq(chatChat.groupId, groupId)),
            )
            .limit(1);

          if (chats.length === 0) return Option.none();
          return Option.some(chats[0]);
        }).pipe(Effect.withSpan("chatRepositoryImpl.getGroupChat")),
    };
  }),
);
