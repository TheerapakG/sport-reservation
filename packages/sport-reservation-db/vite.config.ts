import { builtinModules } from "module";
import path from "pathe";
import { Plugin, defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    target: "node20",
    lib: {
      entry: {
        schema: "./src/schema",
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [...builtinModules, /^node:/, "drizzle-orm"],
    },
  },
  resolve: {
    alias: {
      "~~": path.resolve("./"),
      "@@": path.resolve("./"),
    },
  },
  plugins: [
    dts({
      include: ["./src/schema.ts"],
    }),
  ] as Plugin[],
});
