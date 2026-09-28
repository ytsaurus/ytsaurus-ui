import { defineConfig } from "eslint/config";

import { filesFrom } from "../eslint.config-paths.ts";

export default defineConfig({
  files: filesFrom(import.meta.dirname, "**/*.{js,jsx,ts,tsx}"),
  rules: {
    camelcase: "off",
    "no-negated-condition": "off",
    "import/order": "off",
  },
});
