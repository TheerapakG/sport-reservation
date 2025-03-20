import { ArkErrors, type } from "arktype";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const env = type({ POSTGRES_URL: "string" })(process.env);
if (env instanceof ArkErrors) {
  console.error(env);
  throw env;
}
export default defineConfig({
  schema: "./src/schema.ts",
  dialect: "postgresql",
  extensionsFilters: ["postgis"],
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
});
