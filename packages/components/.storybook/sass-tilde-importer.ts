import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

/** Resolves `~pkg/...` to `packages/components/node_modules/pkg/...` (same idea as @gravity-ui/app-builder). */
const nodeModules = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../node_modules');

export const sassTildeImporter = {
    findFileUrl(url: string) {
        if (url.startsWith('file:')) {
            return null;
        }
        if (url.startsWith('~')) {
            return pathToFileURL(path.join(nodeModules, url.slice(1)));
        }
        return null;
    },
};
