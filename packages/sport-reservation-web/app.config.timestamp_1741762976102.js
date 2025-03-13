// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import tsConfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"]
      })
    ]
  },
  server: {
    static: false,
    preset: "node-server"
  },
  react: {
    babel: {
      plugins: [["babel-plugin-react-compiler", {}]]
    }
  }
});
export {
  app_config_default as default
};
