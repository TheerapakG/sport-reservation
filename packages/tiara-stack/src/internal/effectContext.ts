import { Context, Effect, Layer, Scope, SynchronizedRef } from "effect";

type EffectContextServices<Services> = {
  latch: Effect.Latch;
  ref: SynchronizedRef.SynchronizedRef<{
    scope: Scope.CloseableScope;
    context: Context.Context<Services>;
  }>;
};

export class EffectContext
  extends /*@__PURE__*/ Context.Tag("EffectContext")<
    EffectContext,
    EffectContextServices<unknown>
  >()
{
  public static typed<Services>() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisCls = this;
    return Effect.gen(function* () {
      return (yield* thisCls) as EffectContextServices<Services>;
    });
  }
}

const cachedEffectContext = Effect.cached(
  Effect.gen(function* () {
    return {
      latch: yield* Effect.makeLatch(),
      ref: yield* SynchronizedRef.make({
        scope: yield* Scope.make(),
        context: Context.empty() as Context.Context<unknown>,
      }),
    };
  }),
);

export const effectContextLive = Layer.effect(
  EffectContext,
  Effect.gen(function* () {
    return yield* yield* cachedEffectContext;
  }),
);
