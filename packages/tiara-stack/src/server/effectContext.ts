import {
  Console,
  Context,
  Effect,
  Exit,
  Layer,
  Scope,
  SynchronizedRef,
} from "effect";

export type EffectContextServices<Services> = {
  latch: Effect.Latch;
  ref: SynchronizedRef.SynchronizedRef<{
    scope: Scope.CloseableScope;
    context: Context.Context<Services>;
  }>;
};

export const getEffectContext = <Services>(): Context.TagClass<
  unknown,
  "EffectContext",
  EffectContextServices<Services>
> => {
  return class EffectContext
    extends /*@__PURE__*/ Context.Tag("EffectContext")<
      EffectContext,
      EffectContextServices<Services>
    >() {} as Context.TagClass<
    unknown,
    "EffectContext",
    EffectContextServices<Services>
  >;
};

export type EffectContextHooks = {
  start: () => Promise<void>;
  close: () => Promise<void>;
};

export const getEffectContextHooks = <Services>({
  layer,
}: {
  layer: Layer.Layer<Services, unknown>;
}): Effect.Effect<{
  EffectContext: Context.TagClass<
    unknown,
    "EffectContext",
    EffectContextServices<Services>
  >;
  effectContext: EffectContextServices<Services>;
  hooks: EffectContextHooks;
}> =>
  Effect.gen(function* () {
    const EffectContext = getEffectContext<Services>();
    const effectContext = EffectContext.of({
      latch: yield* Effect.makeLatch(),
      ref: yield* SynchronizedRef.make({
        scope: yield* Scope.make(),
        context: Context.empty() as Context.Context<Services>,
      }),
    });

    return {
      EffectContext,
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

export const getInnerContext = <Services>(
  effectContext: EffectContextServices<Services>,
) =>
  Effect.gen(function* () {
    const { latch, ref } = effectContext;
    yield* latch.await;
    const { context } = yield* SynchronizedRef.get(ref);
    return context;
  });
