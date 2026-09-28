import { defineConfig } from "eslint/config";
import globals from "globals";

import { filesFrom } from "../../../../eslint.config-paths.ts";

export default defineConfig({
  files: filesFrom(import.meta.dirname, "**/*.{js,jsx,ts,tsx}"),
  languageOptions: {
    globals: { ...globals.commonjs, ...globals.es6 },
  },
});
