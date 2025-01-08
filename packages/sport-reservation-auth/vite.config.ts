import { builtinModules } from "module";
import path from "pathe";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    target: "node20",
    lib: {
      entry: {
        client: "./.theestack/client",
        mock: "./.theestack/mock",
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
      output: {
        preserveModules: true,
      },
    },
  },
  resolve: {
    alias: {
      "#imports": path.resolve(".nitro/types/nitro-imports"),
      "~": path.resolve("./server"),
      "@": path.resolve("./server"),
      "~~": path.resolve("./"),
      "@@": path.resolve("./"),
    },
  },
  plugins: [
    dts({
      include: ["./.theestack/client.ts", "./.theestack/mock.ts"],
    }),
  ],
});
