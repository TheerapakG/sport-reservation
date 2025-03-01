import { config, defineTiaraConfig, redacted } from "tiara-stack/config";

export default defineTiaraConfig({
  name: "chat",
  runtimeConfig: {
    secretPath: config("string"),
    postgresUrl: redacted("string"),
    valkeyUrl: redacted("string"),
    kafka: {
      bootstrapUrl: config("string"),
      ssl: {
        key: config("string"),
        cert: config("string"),
        ca: config("string"),
      },
    },
  },
});
