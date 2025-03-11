import { Cause, Context, Effect, Stream } from "effect";

export class PartitionedPubSub extends Context.Tag("PartitionedPubSub")<
  PartitionedPubSub,
  {
    publish: (data: {
      messages: {
        partition: number;
        value: Buffer;
      }[];
    }) => Effect.Effect<void, Cause.UnknownException>;
    subscribe: () => Stream.Stream<Buffer | null>;
    partitionAssignment: () => Effect.Effect<{ partition: number }[]>;
    partitionRebalanceEvent: () => Stream.Stream<{ partition: number }[]>;
  }
>() {}
