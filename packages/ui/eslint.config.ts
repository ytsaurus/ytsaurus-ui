import baseConfig from "@gravity-ui/eslint-config";
import prettierConfig from "@gravity-ui/eslint-config/prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import lodashPlugin from "eslint-plugin-lodash";
import globals from "globals";

import { filesFrom } from "./eslint.config-paths.ts";
import sourceConfig from "./src/.eslint.config.ts";
import serverConfig from "./src/server/.eslint.config.ts";
import sharedConfig from "./src/shared/.eslint.config.ts";
import clientConfig from "./src/ui/.eslint.config.ts";
import commonConfig from "./src/ui/common/.eslint.config.ts";
import hammerConfig from "./src/ui/common/hammer/.eslint.config.ts";
import packagesConfig from "./src/ui/packages/.eslint.config.ts";
import thorConfig from "./src/ui/store/selectors/thor/.eslint.config.ts";
import testsConfig from "./tests/.eslint.config.ts";

const uiRules = {
  "no-console": "error",
  radix: "error",
  "no-lonely-if": "error",
  "no-nested-ternary": "error",
  "callback-return": "error",
  eqeqeq: "error",
  "no-throw-literal": "error",
  "no-param-reassign": ["error", { props: false }],
  "new-cap": "off",
  "import/order": "off",
  "import/dynamic-import-chunkname": [
    "error",
    {
      importFunctions: ["dynamicImport"],
      webpackChunknameFormat: "[a-zA-Z-]+",
      allowEmpty: false,
    },
  ],
  "lodash/chaining": ["error", "never"],
  "lodash/import-scope": "error",
  "no-restricted-imports": [
    "error",
    {
      paths: [
        {
          name: "@gravity-ui/uikit",
          importNames: ["Dialog"],
          message: "Please use src/components/YTDialog instead.",
        },
        {
          name: "@gravity-ui/uikit",
          importNames: ["Modal"],
          message:
            "Please use src/components/Modal or src/components/SimpleModal instead.",
        },
        {
          name: "@gravity-ui/dialog-fields",
          importNames: ["DFDialog"],
          message: "Please use src/components/Dialog instead.",
        },
        {
          name: "@gravity-ui/date-utils",
          message: "Please use utils/date-utils instead.",
        },
      ],
    },
  ],
  "object-shorthand": ["error", "always"],
  "no-useless-rename": "error",
};

export default defineConfig(
  globalIgnores([
    "**/.*",
    "**/dist/**",
    "**/build/**",
    "**/node_modules.bak/**",
    "src/ui/vendor/**",
  ]),
  ...baseConfig,
  ...prettierConfig,
  {
    files: filesFrom(import.meta.dirname, "jest.config.js"),
    languageOptions: { globals: globals.node },
  },
  {
    files: filesFrom(import.meta.dirname, "**/*.{js,jsx,ts,tsx}"),
    plugins: { lodash: lodashPlugin },
    rules: uiRules,
  },
  {
    files: filesFrom(import.meta.dirname, "src/**/*.spec.{js,jsx,ts,tsx}"),
    languageOptions: { globals: globals.jest },
  },
  {
    files: filesFrom(import.meta.dirname, "**/*.{js,jsx}"),
    rules: {
      "consistent-return": "error",
      "no-shadow": "error",
      "no-use-before-define": "error",
    },
  },
  {
    files: filesFrom(import.meta.dirname, "**/*.{ts,tsx}"),
    rules: {
      "consistent-return": "off",
      "@typescript-eslint/consistent-return": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-use-before-define": [
        "error",
        { functions: false },
      ],
    },
  },
  ...sourceConfig,
  ...serverConfig,
  ...sharedConfig,
  ...clientConfig,
  ...commonConfig,
  ...hammerConfig,
  ...packagesConfig,
  ...thorConfig,
  ...testsConfig,
);
