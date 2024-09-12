import type {AppBrowserHistory, StoreType} from './store.main';
import {MakeRotedUrlFnType} from './location';

export function getWindowStore(): StoreType {
    return (window as any).store;
}

export const makeRoutedURL: MakeRotedUrlFnType = (...args) =>
    (window as any).makeRoutedURL(...args);

export function getAppBrowserHistory(): AppBrowserHistory {
    return (window as any).appBrowserHistory;
}
