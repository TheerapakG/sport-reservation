import { defineNitroConfig } from "nitropack/config";

//https://nitro.unjs.io/config
export default defineNitroConfig({
  extends: "./preset",
  srcDir: "server",
  runtimeConfig: {
    postgresUrl: "NITRO_POSTGRES_URL",
    valkey: {
      host: "NITRO_VALKEY_HOST",
      port: "NITRO_VALKEY_PORT",
      password: "NITRO_VALKEY_PASSWORD",
    },
    line: {
      client: {
        id: "NITRO_LINE_CLIENT_ID",
        secret: "NITRO_LINE_CLIENT_SECRET",
      },
      redirectUri: "NITRO_LINE_REDIRECT_URI",
    },
    upload: {
      baseURL: "NITRO_UPLOAD_BASE_URL",
      secret: "NITRO_UPLOAD_SECRET",
    },
    user: {
      baseURL: "NITRO_USER_BASE_URL",
    },
  },
});
