import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { and, between, eq, inArray, isNull } from "drizzle-orm";
import { Effect, Layer, Option } from "effect";
import {
  chatChat,
  chatChatMessage,
  chatChatSubscription,
} from "sport-reservation-db/schema";
import { ChatDbRepository } from "./chatDbRepository";

export const chatDbRepositoryImpl = /*@__PURE__*/ Layer.scoped(
  ChatDbRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const db = yield* PgDrizzle;

    return ChatDbRepository.of({
      getChatByGroupId: (groupId) =>
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
        }).pipe(Effect.withSpan("chatDbRepositoryImpl.getChatByGroupId")),
      getChatByChatId: (chatId) =>
        Effect.gen(function* () {
          const chats = yield* db
            .select()
            .from(chatChat)
            .where(
              and(isNull(chatChat.deletedAt), eq(chatChat.publicId, chatId)),
            )
            .limit(1);

          if (chats.length === 0) return Option.none();
          return Option.some(chats[0]);
        }).pipe(Effect.withSpan("chatDbRepositoryImpl.getChatByChatId")),
      getUsersPartitions: (userIds) =>
        Effect.gen(function* () {
          const partitions = yield* db
            .select({
              partition: chatChatSubscription.partition,
              userId: chatChatSubscription.userId,
            })
            .from(chatChatSubscription)
            .where(inArray(chatChatSubscription.userId, userIds));

          return partitions;
        }).pipe(Effect.withSpan("chatDbRepositoryImpl.getUsersPartitions")),
      setUserChatMessagesSubscription: (userId, partition) =>
        Effect.gen(function* () {
          const subscriptions = yield* db
            .insert(chatChatSubscription)
            .values({
              userId,
              partition,
            })
            .returning({ publicId: chatChatSubscription.publicId });

          if (subscriptions.length === 0) return Option.none();
          return Option.some(subscriptions[0]);
        }).pipe(
          Effect.withSpan(
            "chatDbRepositoryImpl.setUserChatMessagesSubscription",
          ),
        ),
      setSubscriptionsPartition: ({ subscriptionIds, partition }) =>
        Effect.gen(function* () {
          yield* db
            .update(chatChatSubscription)
            .set({ partition })
            .where(inArray(chatChatSubscription.publicId, subscriptionIds));
        }).pipe(
          Effect.withSpan("chatDbRepositoryImpl.setSubscriptionsPartition"),
        ),
      deleteUserChatMessagesSubscription: (subscriptionId) =>
        Effect.gen(function* () {
          yield* db
            .update(chatChatSubscription)
            .set({ deletedAt: new Date() })
            .where(eq(chatChatSubscription.publicId, subscriptionId));
        }).pipe(
          Effect.withSpan(
            "chatDbRepositoryImpl.deleteUserChatMessagesSubscription",
          ),
        ),
      getChatMessages: ({ chatId, from, to }) =>
        Effect.gen(function* () {
          const messages = yield* db
            .select()
            .from(chatChatMessage)
            .where(
              and(
                isNull(chatChatMessage.deletedAt),
                eq(chatChatMessage.chatId, chatId),
                between(chatChatMessage.createdAt, from, to),
              ),
            );

          return messages;
        }).pipe(Effect.withSpan("chatDbRepositoryImpl.getChatMessages")),
      addChatMessage: ({ chatId, senderId, message, imageUrl }) =>
        Effect.gen(function* () {
          const dbChatMessages = yield* db
            .insert(chatChatMessage)
            .values({ chatId, senderId, message, imageUrl })
            .returning();

          if (dbChatMessages.length === 0) return Option.none();
          return Option.some(dbChatMessages[0]);
        }).pipe(Effect.withSpan("chatDbRepositoryImpl.addChatMessage")),
    });
  }),
);
