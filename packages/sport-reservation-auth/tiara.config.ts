import { config, defineTiaraConfig, redacted } from "tiara-stack/config";

export default defineTiaraConfig({
  name: "auth",
  runtimeConfig: {
    postgresUrl: redacted("string"),
    valkeyUrl: redacted("string"),
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
      keyFile: {
        private: redacted("string"),
        public: redacted("string"),
      },
    },
    upload: {
      baseUrl: config("string"),
      secret: redacted("string"),
    },
    user: {
      baseUrl: config("string"),
    },
  },
});
