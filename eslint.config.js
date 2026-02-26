// eslint.config.js
import js from "@eslint/js";
import noRelativeImports from "eslint-plugin-no-relative-import-paths";
import svelte from "eslint-plugin-svelte";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".output/**",
      ".source/**",
      "node_modules/**",
      ".wxt/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "**/*.svelte.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs["flat/recommended"],
  ...svelte.configs["flat/prettier"],
  {
    plugins: {
      "no-relative-import-paths": noRelativeImports,
    },
    rules: {
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        {
          allowSameFolder: true, // Keeps safe sibling imports like './styles.css'
          rootDir: "src/lib", // The actual folder path
          prefix: "$lib", // The alias you want it to rewrite to
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".svelte"],
      },
      globals: {
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        MouseEvent: "readonly",
        HTMLElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLSpanElement: "readonly",
        FileList: "readonly",
        console: "readonly",
        window: "readonly",
        document: "readonly",
      },
    },
  },
  {
    files: ["src/entrypoints/background.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
