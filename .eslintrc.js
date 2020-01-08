module.exports = {
  env: {
    jest: true,
    browser: true,
    node: true,
    es6: true
  },
  extends: ["plugin:react/recommended", "eslint:recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: ["react"],
  rules: {
    "no-extra-boolean-cast": 0,
    "no-console": 0,
    "no-debugger": [0, 1],
    "react/no-unescaped-entities": 0,
    "react/display-name": 0,
    "no-empty": 1,
    "no-unsafe-finally": 1,
    "no-fallthrough": 0,
    "space-before-blocks": [
      "error",
      { functions: "always", keywords: "always", classes: "always" }
    ],
    "keyword-spacing": ["error", { before: true, after: true }]
  }
};
