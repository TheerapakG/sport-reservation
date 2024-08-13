import globals from "globals";
import { fixupConfigRules, includeIgnoreFile } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as reactRefresh from "eslint-plugin-react-refresh";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...fixupConfigRules(compat.extends("plugin:@typescript-eslint/recommended")),
  ...fixupConfigRules(compat.extends("plugin:react-hooks/recommended")),
  {
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
      },
    },
    plugins: { "react-refresh": reactRefresh },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
];
