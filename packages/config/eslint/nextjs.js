/** @type {import("eslint").Linter.Config} */
const base = require("./base.js");

/** @type {import("eslint").Linter.Config} */
const config = {
  ...base,
  extends: [...(base.extends ?? []), "next/core-web-vitals"],
  rules: {
    ...base.rules
  }
};

module.exports = config;
