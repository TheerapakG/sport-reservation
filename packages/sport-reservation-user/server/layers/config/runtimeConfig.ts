import { Config, Context, Layer } from "effect";
import {
  effectConfig,
  InferConfig,
  redacted,
} from "sport-reservation-common/utils/effectConfig";

const configShape = {
  postgresUrl: redacted("string"),
};

export class RuntimeConfig
  extends /*@__PURE__*/ Context.Tag("RuntimeConfig")<
    RuntimeConfig,
    Config.Config<InferConfig<typeof configShape>>
  >() {}

export const runtimeConfig = Layer.effect(
  RuntimeConfig,
  effectConfig(configShape),
);
