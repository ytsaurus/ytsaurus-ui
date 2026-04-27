import path from 'node:path';
import {pathToFileURL} from 'node:url';

/**
 * Resolves `~pkg/...` to `<nodeModulesDir>/pkg/...` (same as @gravity-ui/app-builder).
 * @param nodeModulesDir - Absolute path to `node_modules`.
 * @returns Sass modern API importer for `findFileUrl`.
 */
export const createSassTildeImporter = (nodeModulesDir: string) => ({
    findFileUrl(url: string) {
        if (url.startsWith('file:')) {
            return null;
        }
        if (url.startsWith('~')) {
            return pathToFileURL(path.join(nodeModulesDir, url.slice(1)));
        }
        return null;
    },
});
