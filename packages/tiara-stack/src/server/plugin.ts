import {
  Console,
  Context,
  Effect,
  Exit,
  Layer,
  Scope,
  SynchronizedRef,
} from "effect";
import { defineNitroPlugin } from "nitropack/runtime";
import { EffectContext, effectContextLive } from "../internal/effectContext";

export const defineEffectContextPlugin = <R = never>({
  defineFn,
  layer,
}: {
  defineFn: typeof defineNitroPlugin;
  layer: Layer.Layer<R, unknown>;
}) =>
  defineFn(async (nitroApp) => {
    const contextExit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const { latch, ref } = yield* EffectContext.typed<R>();
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
      }).pipe(Effect.provide(effectContextLive)),
    );

    if (Exit.isFailure(contextExit)) {
      const cause = contextExit.cause;
      Effect.runSync(Effect.log(cause));
      throw new Error("cannot build requirements context!");
    }

    nitroApp.hooks.hookOnce("close", async () => {
      await Effect.runPromiseExit(
        Effect.gen(function* () {
          const { latch, ref } = yield* EffectContext.typed<never>();
          yield* latch.close;
          yield* SynchronizedRef.updateEffect(ref, ({ scope }) =>
            Effect.gen(function* () {
              yield* Console.log("closing requirements context...");
              yield* Scope.close(scope, Exit.void);
              return { scope: yield* Scope.make(), context: Context.empty() };
            }),
          );
          yield* Console.log("closed requirements context!");
        }).pipe(Effect.provide(effectContextLive)),
      );
    });
  });
