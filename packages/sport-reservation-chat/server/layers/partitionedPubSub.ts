import { Context, PubSub } from "effect";

export class PartitionedPubSub
  extends /*@__PURE__*/ Context.Tag("PartitionedPubSub")<
    PartitionedPubSub,
    {
      pubSub: PubSub.PubSub<unknown>;
    }
  >() {}
