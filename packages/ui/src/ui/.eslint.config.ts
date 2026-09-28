import clientConfig from "@gravity-ui/eslint-config/client";
import { defineConfig } from "eslint/config";

import { filesFrom } from "../../eslint.config-paths.ts";

export default defineConfig({
  files: filesFrom(import.meta.dirname, "**/*.{js,jsx,ts,tsx}"),
  extends: [clientConfig],
  rules: {
    "import/order": "off",
    "react/prop-types": "warn",
    "react/sort-comp": "off",
    "no-restricted-globals": [
      "error",
      {
        name: "crypto",
        message: "Web Crypto API is not available in insecure contexts (HTTP)",
      },
    ],
    "no-restricted-properties": [
      "error",
      {
        object: "window",
        property: "crypto",
        message: "Web Crypto API is not available in insecure contexts (HTTP)",
      },
      {
        object: "globalThis",
        property: "crypto",
        message: "Web Crypto API is not available in insecure contexts (HTTP)",
      },
    ],
  },
});
