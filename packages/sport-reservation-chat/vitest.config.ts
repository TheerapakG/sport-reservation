import path from "pathe";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    server: {
      deps: {
        inline: true,
      },
    },
  },
  resolve: {
    alias: {
      "#imports": path.resolve(__dirname, ".nitro/types/nitro-imports"),
      "~": path.resolve(__dirname, "./server"),
      "@": path.resolve(__dirname, "./server"),
      "~~": path.resolve(__dirname, "./"),
      "@@": path.resolve(__dirname, "./"),
      $: path.resolve(__dirname, "./.tiara"),
    },
  },
});
