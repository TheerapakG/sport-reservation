import { Effect, Layer, PubSub, Sink, Stream, SubscriptionRef } from "effect";
import { Kafka } from "~/layers/kafka";
import { PartitionedPubSub } from "./partitionedPubSub";

export const kafkaPartitionedPubSubImpl = /*@__PURE__*/ ({
  groupId,
  topic,
}: {
  groupId: string;
  topic: string;
}) =>
  Layer.scoped(
    PartitionedPubSub,
    Effect.gen(function* () {
      const { kafka } = yield* Kafka;

      const consumerAssignment = yield* SubscriptionRef.make<
        { partition: number }[]
      >([]);

      const producer = kafka.producer();
      const consumer = kafka.consumer({
        "group.id": groupId,
        rebalance_cb: () => {
          Effect.runPromise(
            SubscriptionRef.set(consumerAssignment, consumer.assignment()),
          );
        },
      });

      const messagePubSub = yield* PubSub.bounded<Buffer | null>(128);
      const rebalanceEvent = yield* PubSub.bounded<{ partition: number }[]>(2);

      yield* Effect.acquireRelease(
        Effect.gen(function* () {
          yield* Effect.tryPromise(
            async () =>
              await Promise.all([
                producer.connect(),
                (async () => {
                  await consumer.connect();
                  await consumer.subscribe({
                    topics: [topic],
                  });
                })(),
              ]),
          );

          yield* Effect.forkScoped(
            Effect.tryPromise(() =>
              consumer.run({
                eachMessage: async ({ message }) => {
                  await Effect.runPromise(messagePubSub.publish(message.value));
                },
              }),
            ),
          );

          yield* Effect.forkScoped(
            Stream.run(
              consumerAssignment.changes,
              Sink.forEach(rebalanceEvent.publish),
            ),
          );
        }),
        () =>
          Effect.promise(
            async () =>
              await Promise.all([
                producer.disconnect(),
                (async () => {
                  await consumer.stop();
                  await consumer.disconnect();
                })(),
              ]),
          ),
      );

      return PartitionedPubSub.of({
        publish: ({ messages }) =>
          Effect.gen(function* () {
            yield* Effect.tryPromise(() =>
              producer.send({
                topic,
                messages,
              }),
            );
          }),
        subscribe: () => Stream.fromPubSub(messagePubSub),
        partitionAssignment: () => Effect.succeed(consumer.assignment()),
        partitionRebalanceEvent: () => Stream.fromPubSub(rebalanceEvent),
      });
    }),
  );
