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
  started: SynchronizedRef.SynchronizedRef<boolean>;
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
      started: yield* SynchronizedRef.make(false),
      latch: yield* Effect.makeLatch(),
      ref: yield* SynchronizedRef.make({
        scope: yield* Scope.make(),
        context: Context.empty() as Context.Context<Services>,
      }),
    };
  });

export type EffectContextHooks<E> = {
  startEffect: Effect.Effect<void, E>;
  closeEffect: Effect.Effect<void>;
  start: () => Promise<void>;
  close: () => Promise<void>;
};

/*@__NO_SIDE_EFFECTS__*/
export const getEffectContextHooks = <Services, E>({
  layer,
}: {
  layer: Layer.Layer<Services, E>;
}): Effect.Effect<{
  effectContext: EffectContext<Services>;
  hooks: EffectContextHooks<E>;
}> =>
  Effect.gen(function* () {
    const effectContext = yield* newEffectContext<Services>();

    const startEffect = SynchronizedRef.getAndUpdateEffect(
      effectContext.started,
      (started) =>
        Effect.gen(function* () {
          if (started) {
            return true;
          }
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
          return true;
        }),
    ).pipe(
      Effect.tapError(() => Console.log("cannot build requirements context!")),
      Effect.asVoid,
    );

    const closeEffect = SynchronizedRef.getAndUpdateEffect(
      effectContext.started,
      (started) =>
        Effect.gen(function* () {
          if (!started) {
            return false;
          }
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
          return false;
        }),
    ).pipe(Effect.asVoid);

    return {
      effectContext,
      hooks: {
        startEffect,
        closeEffect,
        start: async () => {
          await Effect.runPromise(startEffect);
        },
        close: async () => {
          await Effect.runPromise(closeEffect);
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
    yield* latch.await;
    const { context } = yield* SynchronizedRef.get(ref);
    return context;
  });
