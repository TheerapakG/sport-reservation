import { defineEffectContextPlugin } from "tiara-stack/server/plugin";
import { hooks } from "../utils/effectContext";

export default defineEffectContextPlugin({
  defineFn: (plugin) => plugin,
  hooks,
});
