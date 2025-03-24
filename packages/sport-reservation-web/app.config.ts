import { defineConfig } from "@tanstack/react-start/config";
import { Plugin } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }) as Plugin,
    ],
  },
  server: {
    static: false,
    preset: "node-server",
    plugins: ["./app/plugins/effectContext"],
  },
  react: {
    babel: {
      plugins: [["babel-plugin-react-compiler", {}]],
    },
  },
});
