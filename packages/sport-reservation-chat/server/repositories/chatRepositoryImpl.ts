import { KafkaJS } from "@confluentinc/kafka-javascript";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { decodeMulti, encode } from "@msgpack/msgpack";
import { type } from "arktype";
import { and, between, eq, inArray, isNull } from "drizzle-orm";
import {
  Chunk,
  Effect,
  ExecutionStrategy,
  Exit,
  GroupBy,
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

    const consumerChatMessage = yield* PubSub.bounded<{
      userIds: string[];
      message: typeof chatChatMessage.$inferSelect;
    }>(128);

    yield* Effect.forkScoped(
      Effect.tryPromise(() =>
        consumer.run({
          eachMessage: async ({ message }) =>
            await Effect.runPromise(
              Effect.gen(function* () {
                const { value } = message;
                if (!value) return;

                const [decodedUserIds, decodedMessage] = Array.from(
                  decodeMulti(value),
                );
                const validatedUserIds = yield* effectType(
                  type("string[]"),
                  decodedUserIds,
                );
                const validatedMessage = yield* effectType(
                  chatMessageInternal,
                  decodedMessage,
                );

                yield* consumerChatMessage.publish({
                  userIds: validatedUserIds,
                  message: validatedMessage,
                });
              }),
            ),
        }),
      ),
    );
    yield* Effect.addFinalizer(() => Effect.promise(() => consumer.stop()));

    const subscriptionScopeHashMapRef = yield* SynchronizedRef.make(
      HashMap.empty<string, Scope.CloseableScope>(),
    );

    yield* Effect.fork(
      Stream.runDrain(
        consumerRebalance.subscribe.pipe(
          Stream.fromEffect,
          Stream.flatMap((dequeue) => Stream.fromQueue(dequeue)),
          Stream.tap(([partition]) =>
            Effect.gen(function* () {
              const subscriptionIds = HashMap.keySet(
                yield* SynchronizedRef.get(subscriptionScopeHashMapRef),
              );
              yield* db
                .update(chatChatSubscription)
                .set({ partition: partition.partition })
                .where(
                  inArray(
                    chatChatSubscription.publicId,
                    Array.from(subscriptionIds),
                  ),
                );
            }),
          ),
        ),
      ),
    );

    return ChatRepository.of({
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
        }).pipe(Effect.withSpan("chatRepositoryImpl.getChatByGroupId")),
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
        }).pipe(Effect.withSpan("chatRepositoryImpl.getChatByChatId")),
      subscribeUserChatMessages: (userId) =>
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
          ).pipe(
            Stream.flatMap((dequeue) => Stream.fromQueue(dequeue)),
            Stream.filter(({ userIds }) => userIds.includes(userId)),
            Stream.map(({ message }) => message),
          );

          return {
            subscriptionId: subscription.publicId,
            messages,
          };
        }).pipe(
          Effect.withSpan("chatRepositoryImpl.subscribeUserChatMessages"),
        ),
      unsubscribeUserChatMessages: (subscriptionId) =>
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
        }).pipe(
          Effect.withSpan("chatRepositoryImpl.unsubscribeUserChatMessages"),
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
        }).pipe(Effect.withSpan("chatRepositoryImpl.getChatMessages")),
      sendChatMessage: ({ chatId, senderId, receiverIds, message, imageUrl }) =>
        Effect.gen(function* () {
          const [dbChatMessage] = yield* db
            .insert(chatChatMessage)
            .values({ chatId, senderId, message, imageUrl })
            .returning();

          const encodedChatMessage = encode(dbChatMessage);

          const chatSubscriptionUserPartitions = GroupBy.evaluate(
            Stream.fromIterableEffect(
              db
                .select({
                  partition: chatChatSubscription.partition,
                  userId: chatChatSubscription.userId,
                })
                .from(chatChatSubscription)
                .where(inArray(chatChatSubscription.userId, receiverIds)),
            ).pipe(Stream.groupByKey(({ partition }) => partition)),
            (partition, stream) =>
              Stream.fromEffect(
                Effect.gen(function* () {
                  const userIds = yield* Stream.runCollect(
                    stream.pipe(Stream.map(({ userId }) => userId)),
                  );

                  return {
                    partition,
                    userIds,
                  };
                }),
              ),
          );

          const producerMessages = yield* Stream.runCollect(
            chatSubscriptionUserPartitions.pipe(
              Stream.map(({ partition, userIds }) => ({
                partition,
                value: Buffer.concat([
                  encode(Chunk.toArray(userIds)),
                  encodedChatMessage,
                ]),
              })),
            ),
          );

          yield* Effect.tryPromise(() =>
            producer.send({
              topic: "sport-reservation.chat.message",
              messages: Chunk.toArray(producerMessages),
            }),
          );
        }).pipe(Effect.withSpan("chatRepositoryImpl.sendChatMessage")),
    });
  }),
);
