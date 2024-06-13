import type {AppBrowserHistory, StoreType} from './store.main';
import {MakeRotedUrlFnType} from './location';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

export function getWindowStore(): StoreType {
    return (window as any).store;
}

export const makeRoutedURL: MakeRotedUrlFnType = (...args) =>
    (window as any).makeRoutedURL(...args);

export function getAppBrowserHistory(): AppBrowserHistory {
    return (window as any).appBrowserHistory;
}

(window as any).uiApi = {
    createPoolAndLoadScheduling: async (pool: string, tree: string) => {
        try {
            await yt.v3.create({
                type: 'scheduler_pool',
                attributes: Object.assign({
                    name: pool,
                    pool_tree: tree,
                }),
            });
        } catch {}
        setTimeout(async () => {
            const {loadSchedulingData} = await import('./actions/scheduling/scheduling-ts');
            getWindowStore().dispatch(loadSchedulingData());
        }, 1500);
    },
};
