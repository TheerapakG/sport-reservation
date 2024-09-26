import { defineNitroConfig } from "nitropack/config";

//https://nitro.unjs.io/config
export default defineNitroConfig({
  extends: "./preset",
  srcDir: "server",
  runtimeConfig: {
    postgresUrl: "NITRO_POSTGRES_URL",
    s3: {
      originEndpoint: "NITRO_S3_ORIGIN_ENDPOINT",
      domainEndpoint: "NITRO_S3_DOMAIN_ENDPOINT",
      key: "NITRO_S3_KEY",
      secret: "NITRO_S3_SECRET",
      bucket: "NITRO_S3_BUCKET",
    },
    upload: {
      secret: "NITRO_UPLOAD_SECRET",
    },
  },
});
