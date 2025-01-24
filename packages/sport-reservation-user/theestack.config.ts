import { config, redacted } from "sport-reservation-common/utils/effectConfig";
import { defineTheeStackConfig } from "sport-reservation-common/utils/theeStackConfig";

export default defineTheeStackConfig({
  name: "user",
  runtimeConfig: {
    postgresUrl: redacted("string"),
    upload: {
      baseUrl: config("string"),
      secret: redacted("string"),
    },
  },
});
