import { defineEffectContextPlugin } from "sport-reservation-common/server/plugin";

export default defineEffectContextPlugin({
  defineFn: defineNitroPlugin,
  layer: dependenciesLive,
});
