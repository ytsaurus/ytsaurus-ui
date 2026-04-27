// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {YTApiId, ytApiV3Id} from '../rum/rum-wrap-api';
import {showErrorPopup} from './utils';
import {toaster} from './toaster';
import i18n from './i18n';

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
                toaster.add({
                    name: 'load-default-pool-tree',
                    theme: 'danger',
                    title: i18n('title_failure'),
                    content: i18n('alert_load-default-pool-tree', {path}),
                    actions: [
                        {
                            label: i18n('action_details'),
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });
                return 'physical';
            });
    });
}
