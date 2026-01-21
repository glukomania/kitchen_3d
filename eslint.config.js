import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintConfigPrettier from "eslint-config-prettier";

const tsTypeChecked = tseslint.configs.recommendedTypeChecked.map((cfg) => ({
  ...cfg,
  files: ["**/*.{ts,tsx}"]
}));

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  js.configs.recommended,
  // JS config files should not be type-checked by TS parserOptions.project
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node
    }
  },
  // Provide type information for all TS/TSX (including Vite/Tailwind configs).
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"]
      }
    }
  },
  // Node globals for tooling config TS files.
  {
    files: ["vite*.config.ts", "tailwind.config.ts"],
    languageOptions: {
      globals: globals.node
    }
  },
  ...tsTypeChecked,
  eslintConfigPrettier,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.json"]
      }
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }]
    }
  }
);


