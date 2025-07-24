import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      js,
      react: pluginReact
    },
    rules: {
      // Spread base and react rules first
      ...js.configs.recommended.rules,
      ...pluginReact.configs.flat.recommended.rules,

      // Then override *after*
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ]
    }
  }
]);