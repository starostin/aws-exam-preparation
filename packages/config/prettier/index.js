/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: "all",
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: "always",
  endOfLine: "lf",
  importOrder: [
    "^(react|next)(.*)",
    "<THIRD_PARTY_MODULES>",
    "^@aws-exam-prep/(.*)$",
    "^[./]"
  ],
  plugins: ["@trivago/prettier-plugin-sort-imports"]
};

module.exports = config;
