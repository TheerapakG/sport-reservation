//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  runtimeConfig: {
    postgresUrl: "NITRO_POSTGRES_URL",
  },
  experimental: {
    openAPI: true,
  },
});
