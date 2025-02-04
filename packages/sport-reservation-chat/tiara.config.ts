import { defineTiaraConfig, redacted } from "tiara-stack/config";

export default defineTiaraConfig({
  name: "chat",
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
  },
});
