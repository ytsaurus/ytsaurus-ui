import {type AppBrowserHistory, type StoreType} from './store.main';
import {type Store} from 'redux';

export function setWindowStoreAndHistory(store: Store, appBrowserHistory: AppBrowserHistory) {
    Object.assign(window, {store, appBrowserHistory});
    store.subscribe(() => {
        Object.assign(store, {lastActionTime: Date.now()});
    });
}

export function getWindowStore(): StoreType {
    return (window as any).store;
}

export function getAppBrowserHistory(): AppBrowserHistory {
    return (window as any).appBrowserHistory;
}
