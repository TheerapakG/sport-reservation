import { defineNitroConfig } from "nitropack/config";
import { nitroHooks } from "sport-reservation-common/client/nitroHooks";

//https://nitro.unjs.io/config
// @ts-expect-error Type instantiation is excessively deep and possibly infinite.
export default defineNitroConfig({
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
  hooks: nitroHooks,
});
