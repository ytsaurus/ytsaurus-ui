import {Store, configureStore} from '@reduxjs/toolkit';
// @ts-ignore
import {listenForHistoryChange} from 'redux-location-state';
import {createBrowserHistory} from 'history';
import getLocationMiddleware from '../state-url-mapping';
import {RootState, makeRootReducer} from './reducers';

export const createAppStore = () => {
    const history = createBrowserHistory();
    const rootReducer = makeRootReducer();
    const {locationMiddleware, reducersWithLocation} = getLocationMiddleware(history, rootReducer);

    const store: Store<RootState, any> = configureStore({
        reducer: reducersWithLocation as ReturnType<typeof makeRootReducer>,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({serializableCheck: false}).concat(locationMiddleware),
        devTools: process.env.NODE_ENV !== 'production',
    });

    listenForHistoryChange(store, history);
    (window as any).appBrowserHistory = history;
    (window as any).store = store;
    return {store, history};
};

export type AppBrowserHistory = ReturnType<typeof createAppStore>['history'];
export type StoreType = ReturnType<typeof createAppStore>['store'];
