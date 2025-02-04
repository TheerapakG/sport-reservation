import { config, defineTiaraConfig, redacted } from "tiara-stack/config";

export default defineTiaraConfig({
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
