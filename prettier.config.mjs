/** @type { import("prettier").Config } */
const config = {
  arrowParens: "always",
  singleQuote: false,
  semi: true,
  printWidth: 120,
  trailingComma: "all",
  tabWidth: 2,
  plugins: ["prettier-plugin-tailwindcss", "@ianvs/prettier-plugin-sort-imports"],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy", "explicitResourceManagement"],
  importOrderTypeScriptVersion: "5.0.0",
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/server/(.*)$",
    "^@/lib/(.*)$",
    "",
    "^@/components/(.*)$",
    "lucide-react",
    "^[./]",
  ],
};

export default config;
