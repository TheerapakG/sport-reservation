import { Effect } from "effect";
import {
  getEffectContextHooks,
  getInnerContext,
} from "tiara-stack/server/effectContext";
import { dependenciesLive } from "../layers/dependencies";

export const { effectContext, hooks } = Effect.runSync(
  getEffectContextHooks({ layer: dependenciesLive }),
);

export const provideEffectContext = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.gen(function* () {
    // TODO: this is a hack to ensure the effect context is started
    yield* hooks.startEffect;
    return yield* effect.pipe(
      Effect.provide(yield* getInnerContext(effectContext)),
    );
  });
