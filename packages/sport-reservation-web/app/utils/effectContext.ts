import { Effect } from "effect";
import { getEffectContextHooks } from "tiara-stack/server/effectContext";
import { dependenciesLive } from "../layers/dependencies";

export const { EffectContext, effectContext, hooks } = Effect.runSync(
  getEffectContextHooks({ layer: dependenciesLive }),
);
