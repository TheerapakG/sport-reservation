import { defineEffectContextPlugin } from "tiara-stack/server/plugin";
import { hooks } from "$/effectContext";

export default defineEffectContextPlugin({
  defineFn: defineNitroPlugin,
  hooks,
});
