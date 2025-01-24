import { defineEffectContextPlugin } from "sport-reservation-common/server/plugin";
import { dependenciesLive } from "~/layers/dependencies";

export default defineEffectContextPlugin({
  defineFn: defineNitroPlugin,
  layer: dependenciesLive,
});
