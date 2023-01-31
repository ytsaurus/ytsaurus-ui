import {Toaster} from '@gravity-ui/uikit';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {YTApiId, ytApiV3Id} from '../rum/rum-wrap-api';
import {showErrorPopup} from './utils';

const SCHEDULER_POOL_TREES = '//sys/scheduler/config/pool_trees_root';

function getPoolTreeRootPath(): Promise<string> {
    return yt.v3.exists({path: SCHEDULER_POOL_TREES}).then((isExist: boolean) => {
        if (!isExist) {
            return '//sys/pool_trees';
        }

        return ytApiV3Id.get(YTApiId.getPoolTreesPath, {path: SCHEDULER_POOL_TREES}).then(
            (path) => {
                return path;
            },
            (err) => {
                return err.code === 500 ? '//sys/pool_trees' : Promise.reject(err);
            },
        );
    });
}

export function ytGetPoolTrees() {
    return getPoolTreeRootPath().then((poolsPath) => {
        return ytApiV3Id.get(YTApiId.getPoolTrees, {path: poolsPath});
    });
}

export function loadDefaultPoolTree() {
    return getPoolTreeRootPath().then((poolsPath) => {
        const path = `${poolsPath}/@default_tree`;
        return ytApiV3Id
            .get(YTApiId.getPoolDefaultPoolTreeName, {path})
            .then((defaultTree: string) => {
                return defaultTree || 'physical';
            })
            .catch((error) => {
                if (error && error.code !== yt.codes.NODE_DOES_NOT_EXIST) {
                }
                const toast = new Toaster();
                toast.add({
                    name: 'load-default-pool-tree',
                    type: 'error',
                    title: 'Failed',
                    content: `Failed to load ${path}, 'physical' will be used as defualt.`,
                    actions: [
                        {
                            label: ' Details',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });
                return 'physical';
            });
    });
}
