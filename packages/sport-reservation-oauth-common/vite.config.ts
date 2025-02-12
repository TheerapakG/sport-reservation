import { builtinModules } from "module";
import path from "pathe";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    target: "node20",
    lib: {
      entry: {
        subjects: "./src/subjects",
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        /^node:/,
        "@openauthjs/openauth",
        "arktype",
      ],
      treeshake: "smallest",
    },
  },
  plugins: [
    dts({
      include: ["./src/*.ts"],
    }),
  ],
});
