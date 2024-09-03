import { defineBuildConfig } from "unbuild";
import path from "path";

export default defineBuildConfig({
  entries: [
    {
      builder: "rollup",
      input: "./routes",
    },
  ],
  declaration: true,
  alias: {
    "#imports": path.resolve(".nitro/types/nitro-imports"),
    "~": path.resolve("./server"),
    "@": path.resolve("./server"),
    "~~": path.resolve("./"),
    "@@": path.resolve("./"),
  },
  rollup: { inlineDependencies: true },
  hooks: {
    "rollup:options": (_, options) => {
      options.treeshake = {
        moduleSideEffects: "no-external",
      };
    },
  },
});
