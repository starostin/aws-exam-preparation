const { resolve } = require("path");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...require("@aws-exam-prep/config/eslint/nextjs"),
  parserOptions: {
    project: resolve(__dirname, "tsconfig.json"),
  },
};
