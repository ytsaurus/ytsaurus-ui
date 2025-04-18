import {Store, configureStore} from '@reduxjs/toolkit';
import {setupListeners} from '@reduxjs/toolkit/query';
// @ts-ignore
import {listenForHistoryChange} from 'redux-location-state';
import {createBrowserHistory} from 'history';
import getLocationMiddleware from '../state-url-mapping';
import {RootState, makeRootReducer} from './reducers/index.main';
import {rootApi} from './api';

export const createMainEntryStore = () => {
    const history = createBrowserHistory();
    const rootReducer = makeRootReducer();
    const {locationMiddleware, reducersWithLocation} = getLocationMiddleware(history, rootReducer);

    const store: Store<RootState, any> = configureStore({
        reducer: reducersWithLocation as ReturnType<typeof makeRootReducer>,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({serializableCheck: false})
                .concat(locationMiddleware)
                .concat(rootApi.middleware),
        devTools: process.env.NODE_ENV !== 'production',
    });

    setupListeners(store.dispatch);

    listenForHistoryChange(store, history);
    (window as any).appBrowserHistory = history;
    (window as any).store = store;
    return {store, history};
};

export type AppBrowserHistory = ReturnType<typeof createMainEntryStore>['history'];
export type StoreType = ReturnType<typeof createMainEntryStore>['store'];
