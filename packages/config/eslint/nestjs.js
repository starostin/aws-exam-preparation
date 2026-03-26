/** @type {import("eslint").Linter.Config} */
const base = require("./base.js");

/** @type {import("eslint").Linter.Config} */
const config = {
  ...base,
  plugins: [...(base.plugins ?? []), "import"],
  rules: {
    ...base.rules,
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error"
  }
};

module.exports = config;
