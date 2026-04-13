import path from 'node:path';
import {pathToFileURL} from 'node:url';

/** Resolves `~pkg/...` to `<nodeModulesDir>/pkg/...` (same idea as @gravity-ui/app-builder). */
export function createSassTildeImporter(nodeModulesDir: string) {
    return {
        findFileUrl(url: string) {
            if (url.startsWith('file:')) {
                return null;
            }
            if (url.startsWith('~')) {
                return pathToFileURL(path.join(nodeModulesDir, url.slice(1)));
            }
            return null;
        },
    };
}
