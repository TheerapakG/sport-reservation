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
    return yield* effect.pipe(
      Effect.provide(yield* getInnerContext(effectContext)),
    );
  });
