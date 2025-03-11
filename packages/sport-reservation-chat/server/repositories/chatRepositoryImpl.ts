import { decodeMulti, encode } from "@msgpack/msgpack";
import { type } from "arktype";
import {
  Chunk,
  Effect,
  Either,
  ExecutionStrategy,
  Exit,
  GroupBy,
  HashMap,
  Layer,
  Option,
  Scope,
  Stream,
  SynchronizedRef,
} from "effect";
import { effectType } from "tiara-stack/utils/effectType";
import { chatMessageInternal } from "~/models";
import { ChatDbRepository } from "./chatDbRepository";
import { ChatRepository } from "./chatRepository";
import { PartitionedPubSub } from "./partitionedPubSub";

export const chatRepositoryImpl = /*@__PURE__*/ Layer.scoped(
  ChatRepository,
  /*@__PURE__*/ Effect.gen(function* () {
    const layerScope = yield* Effect.scope;
    const chatDbRepository = yield* ChatDbRepository;

    const partitionedPubSub = yield* PartitionedPubSub;

    const consumerChatMessagePubSub = yield* Stream.toPubSub(
      partitionedPubSub.subscribe().pipe(
        Stream.filter((message) => message !== null),
        Stream.mapEffect((message) =>
          Effect.either(
            Effect.gen(function* () {
              const [decodedUserIds, decodedMessage] = Array.from(
                decodeMulti(message),
              );
              const validatedUserIds = yield* effectType(
                type("string[]"),
                decodedUserIds,
              );
              const validatedMessage = yield* effectType(
                chatMessageInternal,
                decodedMessage,
              );

              return {
                userIds: validatedUserIds,
                message: validatedMessage,
              };
            }),
          ),
        ),
        Stream.filterMap((either) =>
          either.pipe(
            Either.match({
              onLeft: () => Option.none(),
              onRight: (message) => Option.some(message),
            }),
          ),
        ),
      ),
      128,
    );

    const subscriptionScopeHashMapRef = yield* SynchronizedRef.make(
      HashMap.empty<string, Scope.CloseableScope>(),
    );

    yield* Effect.fork(
      Stream.runDrain(
        partitionedPubSub.partitionRebalanceEvent().pipe(
          Stream.tap(([partition]) =>
            Effect.gen(function* () {
              const subscriptionIds = HashMap.keySet(
                yield* SynchronizedRef.get(subscriptionScopeHashMapRef),
              );
              yield* chatDbRepository.setSubscriptionsPartition({
                subscriptionIds: Array.from(subscriptionIds),
                partition: partition.partition,
              });
            }),
          ),
        ),
      ),
    );

    return ChatRepository.of({
      subscribeUserChatMessages: (userId) =>
        Effect.gen(function* () {
          const [{ partition }] =
            yield* partitionedPubSub.partitionAssignment();
          const subscription =
            yield* yield* chatDbRepository.setUserChatMessagesSubscription(
              userId,
              partition,
            );

          const scope = yield* Scope.fork(
            layerScope,
            ExecutionStrategy.sequential,
          );

          yield* SynchronizedRef.update(
            subscriptionScopeHashMapRef,
            HashMap.set(subscription.publicId, scope),
          );

          const messages = (yield* Stream.fromPubSub(
            consumerChatMessagePubSub,
            {
              scoped: true,
            },
          ).pipe(Scope.extend(scope))).pipe(
            Stream.flattenTake,
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

          yield* chatDbRepository.deleteUserChatMessagesSubscription(
            subscriptionId,
          );
        }).pipe(
          Effect.withSpan("chatRepositoryImpl.unsubscribeUserChatMessages"),
        ),
      sendChatMessage: ({ chatId, senderId, receiverIds, message, imageUrl }) =>
        Effect.gen(function* () {
          const dbChatMessage = yield* yield* chatDbRepository.addChatMessage({
            chatId,
            senderId,
            message,
            imageUrl,
          });

          const encodedChatMessage = encode(dbChatMessage);

          const chatSubscriptionUserPartitions = GroupBy.evaluate(
            Stream.fromIterableEffect(
              chatDbRepository.getUsersPartitions(receiverIds),
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

          yield* partitionedPubSub.publish({
            messages: Chunk.toArray(producerMessages),
          });
        }).pipe(Effect.withSpan("chatRepositoryImpl.sendChatMessage")),
    });
  }),
);
