import { ArkErrors, type } from "arktype";
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const env = type({ POSTGRES_URL: "string" })(process.env);
if (env instanceof ArkErrors) {
  console.error(env);
  throw env;
}
export default defineConfig({
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
});
