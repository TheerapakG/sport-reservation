import { defineBuildConfig } from "unbuild";
import path from "path";

export default defineBuildConfig({
  entries: [
    {
      builder: "rollup",
      input: "./client/client",
    },
  ],
  declaration: true,
  sourcemap: true,
  alias: {
    "#imports": path.resolve(".nitro/types/nitro-imports"),
    "~": path.resolve("./server"),
    "@": path.resolve("./server"),
    "~~": path.resolve("./"),
    "@@": path.resolve("./"),
  },
  externals: ["effect", "arktype", "ofetch", "ufo"],
  rollup: { inlineDependencies: true, esbuild: { minify: true } },
  hooks: {
    "rollup:options": (_, options) => {
      options.treeshake = {
        moduleSideEffects: "no-external",
      };
    },
  },
});
