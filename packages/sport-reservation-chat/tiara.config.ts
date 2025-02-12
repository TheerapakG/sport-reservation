import { defineTiaraConfig, redacted } from "tiara-stack/config";

export default defineTiaraConfig({
  name: "chat",
  runtimeConfig: {
    postgresUrl: redacted("string"),
  },
});
