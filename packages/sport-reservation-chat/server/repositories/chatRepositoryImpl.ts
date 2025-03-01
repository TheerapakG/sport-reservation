import { KafkaJS } from "@confluentinc/kafka-javascript";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { decode, encode } from "@msgpack/msgpack";
import { and, between, eq, isNull } from "drizzle-orm";
import {
  Effect,
  ExecutionStrategy,
  Exit,
  HashMap,
  Layer,
  Option,
  PubSub,
  Ref,
  Scope,
  Sink,
  Stream,
  SubscriptionRef,
  SynchronizedRef,
} from "effect";
import {
  chatChat,
  chatChatMessage,
  chatChatSubscription,
  userUserGroupMember,
} from "sport-reservation-db/schema";
import { effectType } from "tiara-stack/utils/effectType";
import { Kafka } from "~/layers";
import { chatMessageInternal } from "~/models";
import { ChatRepository } from "./chatRepository";

export const chatRepositoryImpl = /*@__PURE__*/ Layer.scoped(
  ChatRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const layerScope = yield* Effect.scope;
    const db = yield* PgDrizzle;

    const { kafka } = yield* Kafka;

    const producer = kafka.producer();
    const consumer = kafka.consumer({
      "group.id": "sport-reservation-chat",
      "enable.auto.commit": false,
      rebalance_cb: () => {
        Effect.runPromise(
          SubscriptionRef.set(consumerAssignment, consumer.assignment()),
        );
      },
    });

    yield* Effect.tryPromise(
      async () =>
        await Promise.all([
          producer.connect(),
          (async () => {
            await consumer.connect();
            await consumer.subscribe({
              topics: ["sport-reservation.chat.message"],
            });
          })(),
        ]),
    );

    const consumerAssignment = yield* SubscriptionRef.make(
      consumer.assignment(),
    );
    const consumerRebalance =
      yield* PubSub.bounded<KafkaJS.TopicPartition[]>(2);
    yield* Effect.forkScoped(
      Stream.run(
        consumerAssignment.changes,
        Sink.forEach(consumerRebalance.publish),
      ),
    );

    const consumerChatMessage =
      yield* PubSub.bounded<typeof chatChatMessage.$inferSelect>(128);

    yield* Effect.forkScoped(
      Effect.tryPromise(() =>
        consumer.run({
          eachMessage: async ({ message }) =>
            await Effect.runPromise(
              Effect.gen(function* () {
                const { value } = message;
                if (!value) return;

                const decoded = decode(value);
                const validated = yield* effectType(
                  chatMessageInternal,
                  decoded,
                );
                yield* consumerChatMessage.publish(validated);
              }),
            ),
        }),
      ),
    );
    yield* Effect.addFinalizer(() => Effect.promise(() => consumer.stop()));

    const subscriptionScopeHashMapRef = yield* SynchronizedRef.make(
      HashMap.empty<string, Scope.CloseableScope>(),
    );

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
      subscribeChatMessages: (userId) =>
        Effect.gen(function* () {
          const [subscription] = yield* db
            .insert(chatChatSubscription)
            .values({
              userId,
              partition: (yield* Ref.get(consumerAssignment))[0].partition,
            })
            .returning();

          const scope = yield* Scope.fork(
            layerScope,
            ExecutionStrategy.sequential,
          );

          yield* SynchronizedRef.update(
            subscriptionScopeHashMapRef,
            HashMap.set(subscription.publicId, scope),
          );

          const messages = Stream.fromEffect(
            consumerChatMessage.subscribe.pipe(Scope.extend(scope)),
          ).pipe(Stream.flatMap((dequeue) => Stream.fromQueue(dequeue)));

          return {
            subscriptionId: subscription.publicId,
            messages,
          };
        }),
      unsubscribeChatMessages: (subscriptionId) =>
        Effect.gen(function* () {
          yield* db
            .update(chatChatSubscription)
            .set({ deletedAt: new Date() })
            .where(eq(chatChatSubscription.publicId, subscriptionId));

          yield* SynchronizedRef.update(
            subscriptionScopeHashMapRef,
            (hashMap) => {
              const newHashMap = HashMap.modifyAt(
                hashMap,
                subscriptionId,
                (userScope) => {
                  Option.map(userScope, (scope) =>
                    Effect.runSync(Scope.close(scope, Exit.void)),
                  );
                  return Option.none();
                },
              );

              return newHashMap;
            },
          );
        }),
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
        }),
      sendChatMessage: ({ chatId, senderId, message, imageUrl }) =>
        Effect.gen(function* () {
          const [dbChatMessage] = yield* db
            .insert(chatChatMessage)
            .values({ chatId, senderId, message, imageUrl })
            .returning();

          const encodedChatMessage = Buffer.from(encode(dbChatMessage));

          const chatGroupIds = db
            .$with("chatUserIds")
            .as(
              db
                .select({ id: chatChat.groupId })
                .from(chatChat)
                .where(eq(chatChat.publicId, chatId)),
            );

          // TODO: call user-service to get user ids from group ids instead
          const chatUserIds = db
            .$with("chatUserIds")
            .as(
              db
                .with(chatGroupIds)
                .select({ id: userUserGroupMember.userId })
                .from(userUserGroupMember)
                .innerJoin(
                  chatGroupIds,
                  eq(userUserGroupMember.groupId, chatGroupIds.id),
                ),
            );

          const chatSubscriptionPartitions = yield* db
            .with(chatUserIds)
            .select({ partition: chatChatSubscription.partition })
            .from(chatChatSubscription)
            .innerJoin(
              chatUserIds,
              eq(chatChatSubscription.userId, chatUserIds.id),
            );

          yield* Effect.tryPromise(() =>
            producer.send({
              topic: "sport-reservation.chat.message",
              messages: chatSubscriptionPartitions.map(({ partition }) => ({
                partition,
                value: encodedChatMessage,
              })),
            }),
          );
        }),
    };
  }),
);
