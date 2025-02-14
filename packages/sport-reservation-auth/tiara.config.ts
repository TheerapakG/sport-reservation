import { config, defineTiaraConfig, redacted } from "tiara-stack/config";

export default defineTiaraConfig({
  name: "auth",
  runtimeConfig: {
    postgresUrl: redacted("string"),
    oauth: {
      clientId: config("string"),
      issuer: config("string"),
    },
    auth: {
      secret: redacted("string"),
    },
  },
});
