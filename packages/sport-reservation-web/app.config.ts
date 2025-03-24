import { defineConfig } from "@tanstack/react-start/config";
import { Plugin } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { hooks } from "./app/utils/effectContext";

await hooks.start();

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
    hooks: {
      close: async () => {
        await hooks.close();
      },
    },
  },
  react: {
    babel: {
      plugins: [["babel-plugin-react-compiler", {}]],
    },
  },
});
