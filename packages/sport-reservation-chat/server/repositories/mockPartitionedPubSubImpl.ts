import {
  Context,
  Effect,
  Layer,
  PubSub,
  Stream,
  SubscriptionRef,
} from "effect";
import { PartitionedPubSub } from "./partitionedPubSub";

export class MockPartitionedPubSubPartitionRebalancer
  extends /*@__PURE__*/ Context.Tag("MockPartitionedPubSubPartitionRebalancer")<
    MockPartitionedPubSubPartitionRebalancer,
    {
      partitionAssignment: SubscriptionRef.SubscriptionRef<
        { partition: number }[]
      >;
    }
  >() {}

export const mockPartitionedPubSubImpl = /*@__PURE__*/ () =>
  Layer.scoped(
    PartitionedPubSub,
    Effect.gen(function* () {
      const { partitionAssignment } =
        yield* MockPartitionedPubSubPartitionRebalancer;

      const messagePubSub = yield* PubSub.bounded<Buffer | null>(128);

      return PartitionedPubSub.of({
        publish: ({ messages }) =>
          Effect.gen(function* () {
            const assignment = yield* SubscriptionRef.get(partitionAssignment);
            const validMessages = messages
              .filter((message) =>
                assignment
                  .map(({ partition }) => partition)
                  .includes(message.partition),
              )
              .map((message) => message.value);

            yield* messagePubSub.publishAll(validMessages);
          }),
        subscribe: () => Stream.fromPubSub(messagePubSub),
        partitionAssignment: () => SubscriptionRef.get(partitionAssignment),
        partitionRebalanceEvent: () => partitionAssignment.changes,
      });
    }),
  );
