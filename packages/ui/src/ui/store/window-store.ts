import {type AppBrowserHistory, type StoreType} from './store.main';
import {type Store} from 'redux';

export function setWindowStore(store: Store) {
    Object.assign(window, {store});
    store.subscribe(() => {
        Object.assign(store, {lastActionTime: Date.now()});
    });
}

export function setWindowStoreAndHistory(store: Store, appBrowserHistory: AppBrowserHistory) {
    setWindowStore(store);
    Object.assign(window, {appBrowserHistory});
}

export function getWindowStore(): StoreType {
    return (window as any).store;
}

export function getAppBrowserHistory(): AppBrowserHistory {
    return (window as any).appBrowserHistory;
}
