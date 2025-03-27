import { defineNitroPlugin } from "nitropack/runtime";
import { EffectContextHooks } from "./effectContext";

export const defineEffectContextPlugin = ({
  defineFn,
  hooks,
}: {
  defineFn: typeof defineNitroPlugin;
  hooks: EffectContextHooks<unknown>;
}) => {
  return defineFn(async (nitroApp) => {
    await hooks.start();
    nitroApp.hooks.hookOnce("close", async () => {
      await hooks.close();
    });
  });
};
