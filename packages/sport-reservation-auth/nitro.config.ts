import { defineNitroConfig } from "nitropack/config";

//https://nitro.unjs.io/config
export default defineNitroConfig({
  preset: "./preset",
  srcDir: "server",
  runtimeConfig: {
    postgresUrl: "NITRO_POSTGRES_URL",
    valkey: {
      host: "NITRO_VALKEY_HOST",
      port: "NITRO_VALKEY_PORT",
      password: "NITRO_VALKEY_PASSWORD",
    },
    line: {
      clientId: "NITRO_LINE_CLIENT_ID",
      redirectUri: "NITRO_LINE_REDIRECT_URI",
    },
  },
});
