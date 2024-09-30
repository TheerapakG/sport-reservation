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
    valkey: {
      host: config("string"),
      port: config("string.integer.parse"),
      password: redacted("string"),
    },
    line: {
      client: {
        id: config("string"),
        secret: redacted("string"),
      },
      redirectUri: config("string"),
    },
    secret: {
      path: redacted("string"),
    },
    auth: {
      keyFile: redacted("string"),
    },
    upload: {
      baseUrl: config("string"),
      secret: redacted("string"),
    },
    user: {
      baseUrl: config("string"),
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
