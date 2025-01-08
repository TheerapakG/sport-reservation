import { defineConfig } from "@tanstack/start/config";
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
  },
});
