import { defineBuildConfig } from "unbuild";
import path from "path";

export default defineBuildConfig({
  entries: [
    {
      builder: "rollup",
      input: "./utils/useUrl",
    },
  ],
  declaration: true,
  sourcemap: true,
  rollup: { inlineDependencies: true, esbuild: { minify: true } },
  hooks: {
    "rollup:options": (_, options) => {
      options.treeshake = {
        moduleSideEffects: "no-external",
      };
    },
  },
});
