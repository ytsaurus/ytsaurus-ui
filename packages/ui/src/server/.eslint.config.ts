import serverConfig from "@gravity-ui/eslint-config/server";
import { defineConfig } from "eslint/config";

import { filesFrom } from "../../eslint.config-paths.ts";

export default defineConfig({
  files: filesFrom(import.meta.dirname, "**/*.{js,jsx,ts,tsx}"),
  extends: [serverConfig],
});
