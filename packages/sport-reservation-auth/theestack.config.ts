import { config, redacted } from "sport-reservation-common/utils/effectConfig";
import { defineTheeStackConfig } from "sport-reservation-common/utils/theeStackConfig";

export default defineTheeStackConfig({
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
