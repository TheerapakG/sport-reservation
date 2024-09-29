import { defineNitroConfig } from "nitropack/config";

//https://nitro.unjs.io/config
export default defineNitroConfig({
  extends: "./preset",
  srcDir: "server",
});
