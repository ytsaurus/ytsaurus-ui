import { globalIgnores } from "eslint/config";

import { filesFrom } from "../../../eslint.config-paths.ts";

export default [globalIgnores(filesFrom(import.meta.dirname, "**/*"))];
