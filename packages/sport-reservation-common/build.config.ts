import { globSync } from "glob";
import path from "pathe";
import { defineBuildConfig } from "unbuild";
import { fileURLToPath } from "url";

export default defineBuildConfig({
  entries: [
    {
      builder: "rollup",
      input: "./client/client",
    },
    {
      builder: "rollup",
      input: "./client/hooks",
    },
    {
      builder: "rollup",
      input: "./db/schema",
    },
    ...globSync("./models/**/*").map((file) => {
      return {
        builder: "rollup" as const,
        input: fileURLToPath(
          new URL(
            file.slice(0, file.length - path.extname(file).length),
            import.meta.url
          )
        ),
      };
    }),
    ...globSync("./utils/**/*").map((file) => {
      return {
        builder: "rollup" as const,
        input: fileURLToPath(
          new URL(
            file.slice(0, file.length - path.extname(file).length),
            import.meta.url
          )
        ),
      };
    }),
  ],
  declaration: true,
  sourcemap: true,
  alias: {
    "~~": path.resolve("./"),
    "@@": path.resolve("./"),
  },
  externals: ["arktype", "effect", "hookable", "nitropack", "pathe", "unbuild"],
  rollup: { inlineDependencies: true },
  hooks: {
    "rollup:options": (_, options) => {
      options.treeshake = {
        moduleSideEffects: "no-external",
      };
    },
  },
});
