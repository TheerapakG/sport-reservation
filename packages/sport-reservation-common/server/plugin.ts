import { Effect, Exit, Layer, Scope } from "effect";
import { defineNitroPlugin } from "nitropack/runtime";

export const defineEffectContextPlugin = <R = never>({
  defineFn,
  layer,
}: {
  defineFn: typeof defineNitroPlugin;
  layer: Layer.Layer<R, unknown>;
}) => {
  return Effect.runSync(
    Effect.gen(function* () {
      const scope = yield* Scope.make();
      return defineFn(async (nitroApp) => {
        const contextExit = await Effect.runPromiseExit(
          Effect.gen(function* () {
            console.log("building requirements context...");
            return yield* Layer.buildWithScope(layer, scope);
          }),
        );
        if (Exit.isFailure(contextExit)) {
          const cause = contextExit.cause;
          Effect.runSync(Effect.log(cause));
          throw new Error("cannot build requirements context!");
        }
        nitroApp.hooks.hook("request", (event) => {
          event.context.effectContext = contextExit.value;
        });
        nitroApp.hooks.hookOnce("close", async () => {
          console.log("closing requirement context scope...");
          await Effect.runPromiseExit(Scope.close(scope, Exit.void));
        });
      });
    }),
  );
};
