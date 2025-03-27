// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
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
    preset: "node-server",
    plugins: ["./app/plugins/effectContext"]
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
