import { config, defineTiaraConfig } from "tiara-stack/config";

export default defineTiaraConfig({
  name: "web",
  runtimeConfig: {
    oauth: {
      issuer: config("string"),
    },
    matching: {
      baseUrl: config("string"),
    },
  },
});
