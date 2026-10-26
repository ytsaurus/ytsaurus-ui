import React from 'react';
import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {type MemoryHistory, createMemoryHistory} from 'history';
import {Provider, useStore} from 'react-redux';
import {Router, useLocation} from 'react-router';
import type {Store} from 'redux';
import {listenForHistoryChange} from 'redux-location-state/lib/listenForHistoryChange';

import {Page} from '../../../constants/index';
import getLocationMiddleware from '../../../state-url-mapping';
import {rootApi} from '../../../store/api';
import {
    type PathParameters,
    getParamSetup,
    registerLocationParameters,
} from '../../../store/location';
import {flowParams, flowStateLocations} from '../../../store/reducers/flow/url-mapping';
import {appReducers} from '../../../store/reducers/index.main';
import {setWindowStoreAndHistory} from '../../../store/window-store';

export type FlowRoutedStoryHarnessProps = {
    children: React.ReactNode;
    initialEntries?: Array<string>;
    urlSync?: boolean;
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
    const store = configureStore({
        reducer: reducersWithLocation as typeof rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({serializableCheck: false, immutableCheck: false})
                .concat(locationMiddleware)
                .concat(rootApi.middleware),
    });
    listenForHistoryChange(store, history);
    return store;
}

export function FlowRoutedStoryHarness({
    children,
    initialEntries,
    urlSync = false,
}: FlowRoutedStoryHarnessProps) {
    const outerStore = useStore() as Store;
    const [{history, store}] = React.useState(() => {
        const memoryHistory = createMemoryHistory({initialEntries});
        return {
            history: memoryHistory,
            store: urlSync ? createUrlSyncedStore(memoryHistory) : outerStore,
        };
    });
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        setWindowStoreAndHistory(store, history);
        setReady(true);
    }, [history, store]);

    if (!ready) {
        return null;
    }
    const routed = <Router history={history}>{children}</Router>;
    return store === outerStore ? routed : <Provider store={store}>{routed}</Provider>;
}

export function FlowRoutedLocationProbe() {
    const {pathname, search} = useLocation();
    return <output data-qa="flow-routed-location">{`${pathname}${search}`}</output>;
}
