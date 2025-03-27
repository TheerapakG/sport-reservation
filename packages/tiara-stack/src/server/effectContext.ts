import {
  Console,
  Context,
  Effect,
  Exit,
  Layer,
  Scope,
  SynchronizedRef,
} from "effect";

export type EffectContext<Services> = {
  latch: Effect.Latch;
  ref: SynchronizedRef.SynchronizedRef<{
    scope: Scope.CloseableScope;
    context: Context.Context<Services>;
  }>;
};

/*@__NO_SIDE_EFFECTS__*/
export const newEffectContext = <Services>(): Effect.Effect<
  EffectContext<Services>
> =>
  Effect.gen(function* () {
    return {
      latch: yield* Effect.makeLatch(),
      ref: yield* SynchronizedRef.make({
        scope: yield* Scope.make(),
        context: Context.empty() as Context.Context<Services>,
      }),
    };
  });

export type EffectContextHooks = {
  start: () => Promise<void>;
  close: () => Promise<void>;
};

/*@__NO_SIDE_EFFECTS__*/
export const getEffectContextHooks = <Services>({
  layer,
}: {
  layer: Layer.Layer<Services, unknown>;
}): Effect.Effect<{
  effectContext: EffectContext<Services>;
  hooks: EffectContextHooks;
}> =>
  Effect.gen(function* () {
    const effectContext = yield* newEffectContext<Services>();

    return {
      effectContext,
      hooks: {
        start: async () => {
          const contextExit = await Effect.runPromiseExit(
            Effect.gen(function* () {
              const { latch, ref } = effectContext;
              yield* SynchronizedRef.updateEffect(ref, ({ scope }) =>
                Effect.gen(function* () {
                  yield* Scope.close(scope, Exit.void);
                  const newScope = yield* Scope.make();
                  yield* Console.log("building requirements context...");
                  const context = yield* Layer.buildWithScope(layer, newScope);
                  return { context, scope: newScope };
                }),
              );
              yield* Console.log("built requirements context!");
              yield* latch.open;
            }),
          );

          if (Exit.isFailure(contextExit)) {
            const cause = contextExit.cause;
            Effect.runSync(Effect.log(cause));
            throw new Error("cannot build requirements context!");
          }
        },
        close: async () => {
          await Effect.runPromiseExit(
            Effect.gen(function* () {
              const { latch, ref } = effectContext;
              yield* latch.close;
              yield* SynchronizedRef.updateEffect(ref, ({ scope }) =>
                Effect.gen(function* () {
                  yield* Console.log("closing requirements context...");
                  yield* Scope.close(scope, Exit.void);
                  return {
                    scope: yield* Scope.make(),
                    context: Context.empty() as Context.Context<Services>,
                  };
                }),
              );
              yield* Console.log("closed requirements context!");
            }),
          );
        },
      },
    };
  });

/*@__NO_SIDE_EFFECTS__*/
export const getInnerContext = <Services>(
  effectContext: EffectContext<Services>,
): Effect.Effect<Context.Context<Services>> =>
  Effect.gen(function* () {
    const { latch, ref } = effectContext;
    console.log("waiting for latch");
    yield* latch.await;
    console.log("latch opened");
    const { context } = yield* SynchronizedRef.get(ref);
    return context;
  });
