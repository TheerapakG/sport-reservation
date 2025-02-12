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
        client: "./.tiara/client",
        mock: "./.tiara/mock",
        models: "./.tiara/models",
      },
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        /^node:/,
        "arktype",
        "effect",
        "ofetch",
        "ufo",
        "vitest",
      ],
      treeshake: "smallest",
    },
  },
  resolve: {
    alias: {
      "#imports": path.resolve(__dirname, ".nitro/types/nitro-imports"),
      "~": path.resolve(__dirname, "./server"),
      "@": path.resolve(__dirname, "./server"),
      "~~": path.resolve(__dirname, "./"),
      "@@": path.resolve(__dirname, "./"),
      $: path.resolve(__dirname, "./.tiara"),
    },
  },
  plugins: [
    dts({
      include: [
        "./.tiara/serverRoutes.ts",
        "./.tiara/client.ts",
        "./.tiara/mock.ts",
        "./.tiara/models.ts",
        "./server/models/*.ts",
      ],
    }),
  ],
});
