import { defineEffectContextPlugin } from "tiara-stack/server/plugin";
import { dependenciesLive } from "~/layers/dependencies";

export default defineEffectContextPlugin({
  defineFn: defineNitroPlugin,
  layer: dependenciesLive,
});
