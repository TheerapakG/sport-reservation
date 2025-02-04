import { config, defineTiaraConfig, redacted } from "tiara-stack/config";

export default defineTiaraConfig({
  name: "user",
  runtimeConfig: {
    postgresUrl: redacted("string"),
    secret: {
      path: redacted("string"),
    },
    auth: {
      keyFile: {
        public: redacted("string"),
      },
    },
    upload: {
      baseUrl: config("string"),
      secret: redacted("string"),
    },
  },
});
