import { Config, Context, Layer } from "effect";
import {
  config,
  effectConfig,
  InferConfig,
  redacted,
} from "sport-reservation-common/utils/effectConfig";

/*@__NO_SIDE_EFFECTS__*/
const createConfigShape = () => {
  return {
    postgresUrl: redacted("string"),
    upload: {
      baseUrl: config("string"),
      secret: redacted("string"),
    },
  };
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
