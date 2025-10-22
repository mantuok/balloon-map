import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";
import babelParser from "@babel/eslint-parser";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,jsx}"],
    ignores: ["node_modules/**", "dist/**", "build/**"],

    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      prettier,
    },

    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "prettier/prettier": "warn",
      "react/react-in-jsx-scope": "off",
    },

    settings: {
      react: { version: "detect" },
    },
  },
];
