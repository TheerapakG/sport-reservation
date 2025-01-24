import { config, redacted } from "sport-reservation-common/utils/effectConfig";
import { defineTheeStackConfig } from "sport-reservation-common/utils/theeStackConfig";

export default defineTheeStackConfig({
  name: "upload",
  runtimeConfig: {
    s3: {
      originEndpoint: config("string"),
      domainEndpoint: config("string"),
      key: config("string"),
      secret: redacted("string"),
      bucket: config("string"),
    },
    upload: {
      secret: redacted("string"),
    },
  },
});
