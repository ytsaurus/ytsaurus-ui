import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {type MemoryHistory, createMemoryHistory} from 'history';
import type {Store} from 'redux';
import {listenForHistoryChange} from 'redux-location-state/lib/listenForHistoryChange';

import {Page} from '../constants/index';
import getLocationMiddleware from '../state-url-mapping';
import {rootApi} from './api';
import {type PathParameters, getParamSetup, registerLocationParameters} from './location';
import {flowParams, flowStateLocations} from './reducers/flow/url-mapping';
import {appReducers} from './reducers/index.main';
import {getAppBrowserHistory, getWindowStore, setWindowStoreAndHistory} from './window-store';

export type FlowStoryRouting = {
    history: MemoryHistory;
    store: Store;
};

function registerFlowStoryLocations() {
    const registered = getParamSetup();
    const locations: Array<[string, PathParameters]> = [
        ...flowStateLocations,
        [`/*/${Page.FLOWS}/*`, [flowParams]],
    ];
    locations.forEach(([path, params]) => {
        if (!(path in registered)) {
            registerLocationParameters(path, params);
        }
    });
}

function createUrlSyncedStore(history: MemoryHistory): Store {
    registerFlowStoryLocations();
    const rootReducer = combineReducers(appReducers);
    const {locationMiddleware, reducersWithLocation} = getLocationMiddleware(history, rootReducer);
    return configureStore({
        reducer: reducersWithLocation as typeof rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({serializableCheck: false, immutableCheck: false})
                .concat(locationMiddleware)
                .concat(rootApi.middleware),
    });
}

function listenForStoryHistoryChange(store: Store, history: MemoryHistory) {
    const unlisteners: Array<() => void> = [];
    listenForHistoryChange(store, {
        get action() {
            return history.action;
        },
        get location() {
            return history.location;
        },
        listen(listener: Parameters<MemoryHistory['listen']>[0]) {
            unlisteners.push(history.listen(listener));
        },
    });
    return () => unlisteners.forEach((unlisten) => unlisten());
}

export function startFlowStoryRouting({
    initialEntries,
    outerStore,
    urlSync,
}: {
    initialEntries?: Array<string>;
    outerStore: Store;
    urlSync: boolean;
}) {
    const previousWindowRefs = {store: getWindowStore(), appBrowserHistory: getAppBrowserHistory()};
    const history = createMemoryHistory({initialEntries});
    const store = urlSync ? createUrlSyncedStore(history) : outerStore;
    const stopListening = urlSync ? listenForStoryHistoryChange(store, history) : () => {};
    setWindowStoreAndHistory(store, history);

    const routing: FlowStoryRouting = {history, store};
    const stop = () => {
        stopListening();
        if (getWindowStore() === store && getAppBrowserHistory() === history) {
            Object.assign(window, previousWindowRefs);
        }
    };
    return {routing, stop};
}
