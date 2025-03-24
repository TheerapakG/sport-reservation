import { Config, Context, Layer } from "effect";
import { effectConfig, InferConfig } from "tiara-stack/config";
import { default as tiaraConfig } from "../../tiara.config.ts";

/*@__NO_SIDE_EFFECTS__*/
const createConfigShape = () => {
  return tiaraConfig.runtimeConfig;
};

export class RuntimeConfig
  extends /*@__PURE__*/ Context.Tag("RuntimeConfig")<
    RuntimeConfig,
    Config.Config<InferConfig<ReturnType<typeof createConfigShape>>>
  >() {}

export const runtimeConfig = /*@__PURE__*/ Layer.effect(
  RuntimeConfig,
  /*@__PURE__*/ effectConfig(createConfigShape()),
);
