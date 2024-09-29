import { Context, Layer } from "effect";
import {
  effectConfig,
  InferConfig,
  config,
  redacted,
} from "sport-reservation-common/utils/effectConfig";

const configShape = {
  s3: {
    originEndpoint: config("string"),
    domainEndpoint: config("string"),
    key: config("string"),
    secret: redacted("string"),
    bucket: config("string"),
  },
  upload: {
    secret: redacted("string"),
  },
};

export class RuntimeConfig
  extends /*@__PURE__*/ Context.Tag("RuntimeConfig")<
    RuntimeConfig,
    InferConfig<typeof configShape>
  >() {}

export const runtimeConfig = Layer.effect(
  RuntimeConfig,
  effectConfig(configShape),
);
