import { config, defineTiaraConfig, redacted } from "tiara-stack/config";

export default defineTiaraConfig({
  name: "friend",
  runtimeConfig: {
    postgresUrl: redacted("string"),
    oauth: {
      clientId: config("string"),
      issuer: config("string"),
    },
    upload: {
      baseUrl: config("string"),
      secret: redacted("string"),
    },
    user: {
      secret: redacted("string"),
    },
  },
});
