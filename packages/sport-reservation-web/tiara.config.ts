import { config, defineTiaraConfig } from "tiara-stack/config";

export default defineTiaraConfig({
  name: "web",
  runtimeConfig: {
    oauth: {
      issuer: config("string"),
    },
    user: {
      baseUrl: config("string"),
    },
    matching: {
      baseUrl: config("string"),
    },
    friend: {
      baseUrl: config("string"),
    },
    club: {
      baseUrl: config("string"),
    },
    event: {
      baseUrl: config("string"),
    },
  },
});
