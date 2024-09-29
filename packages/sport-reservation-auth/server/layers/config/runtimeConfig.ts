import { Context, Layer } from "effect";
import {
  effectConfig,
  InferConfig,
  config,
  redacted,
} from "sport-reservation-common/utils/effectConfig";

const configShape = {
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

export class RuntimeConfig
  extends /*@__PURE__*/ Context.Tag("RuntimeConfig")<
    RuntimeConfig,
    InferConfig<typeof configShape>
  >() {}

export const runtimeConfig = Layer.effect(
  RuntimeConfig,
  effectConfig(configShape),
);
