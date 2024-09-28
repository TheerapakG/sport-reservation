import { globSync } from "glob";
import path from "pathe";
import { defineBuildConfig } from "unbuild";
import { fileURLToPath } from "url";

export default defineBuildConfig({
  entries: [
    {
      builder: "rollup",
      input: "./db/schema",
    },
    ...globSync("./models/**/*", { nodir: true }).map((file) => {
      return {
        builder: "rollup" as const,
        input: fileURLToPath(new URL(file, import.meta.url)),
      };
    }),
    ...globSync("./server/**/*", { nodir: true }).map((file) => {
      return {
        builder: "rollup" as const,
        input: fileURLToPath(new URL(file, import.meta.url)),
      };
    }),
    ...globSync("./utils/**/*", { nodir: true }).map((file) => {
      return {
        builder: "rollup" as const,
        input: fileURLToPath(new URL(file, import.meta.url)),
      };
    }),
  ],
  declaration: true,
  sourcemap: true,
  alias: {
    "~~": path.resolve("./"),
    "@@": path.resolve("./"),
  },
  externals: [
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
    "unbuild",
  ],
  rollup: { inlineDependencies: true },
  hooks: {
    "rollup:options": (_, options) => {
      options.treeshake = {
        moduleSideEffects: "no-external",
      };
    },
  },
});
