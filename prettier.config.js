// prettier.config.js
export default {
  // Svelte specific settings
  svelteSortOrder: "options-scripts-markup-styles",
  svelteStrictMode: false,
  svelteIndentScriptAndStyle: true,

  // IMPORTANT: The import sorter MUST come before the svelte plugin in the array!
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-svelte",
    "prettier-plugin-tailwindcss",
  ],

  // An empty string "" creates an empty line between the groups.
  importOrder: [
    "^svelte(.*)$", // 1. Svelte core packages
    "^wxt(.*)$", // 2. WXT extension APIs
    "<THIRD_PARTY_MODULES>", // 3. NPM packages (like @sentry/svelte)
    "",
    "^\\$lib/(.*)$", // 4. Internal aliased components/services
    "",
    "^[../]", // 5. Parent relative imports
    "^[./]", // 6. Sibling relative imports
  ],
  importOrderParserPlugins: ["typescript", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.0.0",
};
