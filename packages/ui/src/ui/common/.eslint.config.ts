import { defineConfig } from "eslint/config";
import globals from "globals";

import { filesFrom } from "../../../eslint.config-paths.ts";

export default defineConfig({
  files: filesFrom(import.meta.dirname, "**/*.{js,jsx,ts,tsx}"),
  languageOptions: {
    globals: {
      ...globals.amd,
      ...globals.commonjs,
      ...globals.es6,
      YT: "writable",
      thor: "writable",
      hammer: "writable",
      _: "writable",
      moment: "writable",
      d3: "writable",
      tm: "writable",
      BEM: "writable",
      modules: "writable",
    },
  },
  rules: { "prefer-rest-params": "off", "prefer-spread": "off" },
});
