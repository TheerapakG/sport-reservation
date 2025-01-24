import { globSync } from "glob";
import { builtinModules } from "module";
import path from "pathe";
import { fileURLToPath } from "url";
import { defineConfig, Plugin } from "vite";
import dts from "vite-plugin-dts";

const filePaths = globSync("./src/**/*", { nodir: true }).map((file) =>
  fileURLToPath(new URL(file, import.meta.url)),
);

export default defineConfig({
  build: {
    target: "node20",
    lib: {
      entry: Object.fromEntries(
        filePaths.map((filePath) => {
          const relativePath = path.relative("./src", filePath);
          const parsed = path.parse(relativePath);
          const module = path.join(
            parsed.dir.replace(/\.+\//g, ""),
            parsed.name,
          );

          return [module, filePath];
        }),
      ),
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        ...builtinModules,
        /^node:/,
        "@ark/util",
        "arktype",
        "c12",
        "destr",
        "effect",
        "h3",
        "hookable",
        "nitropack",
        "pathe",
        "ufo",
        "vite",
        "vitest",
      ],
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
      include: filePaths,
    }),
  ] as Plugin[],
});
