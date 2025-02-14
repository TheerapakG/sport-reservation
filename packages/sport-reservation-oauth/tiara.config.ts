import { config, defineTiaraConfig, redacted } from "tiara-stack/config";

export default defineTiaraConfig({
  name: "oauth",
  runtimeConfig: {
    postgresUrl: redacted("string"),
    valkeyUrl: redacted("string"),
    allow: {
      clientIds: config("string"),
    },
    auth: {
      baseUrl: config("string"),
      secret: redacted("string"),
    },
    upload: {
      baseUrl: config("string"),
      secret: redacted("string"),
    },
    user: {
      baseUrl: config("string"),
      secret: redacted("string"),
    },
    line: {
      client: {
        id: config("string"),
        secret: redacted("string"),
      },
    },
    google: {
      client: {
        id: config("string"),
        secret: redacted("string"),
      },
    },
  },
});
