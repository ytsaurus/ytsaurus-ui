import {type Middleware, configureStore} from '@reduxjs/toolkit';
import {setupListeners} from '@reduxjs/toolkit/query';
// @ts-ignore
import {listenForHistoryChange} from 'redux-location-state';
import {createBrowserHistory} from 'history';
import getLocationMiddleware from '../state-url-mapping';
import {makeRootReducer} from './reducers/index.main';
import {rootApi} from './api';
import {setWindowStoreAndHistory} from './window-store';

export const createMainEntryStore = () => {
    const history = createBrowserHistory();
    const rootReducer = makeRootReducer();
    const {locationMiddleware, reducersWithLocation} = getLocationMiddleware(history, rootReducer);

    // RTK Query dispatches a registration action before the first location action reaches
    // the reducer. Keep the incoming URL intact until the store has read it.
    let locationReady = false;
    const syncLocation: Middleware = (api) => (next) => {
        const sync = locationMiddleware(api)(next);
        return (action) => (locationReady ? sync(action) : next(action));
    };

    const store = configureStore({
        reducer: reducersWithLocation as ReturnType<typeof makeRootReducer>,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({serializableCheck: false, immutableCheck: false})
                .concat(syncLocation)
                .concat(rootApi.middleware),
        devTools: process.env.NODE_ENV !== 'production',
    });

    listenForHistoryChange(store, history);
    locationReady = true;
    setupListeners(store.dispatch);

    setWindowStoreAndHistory(store, history);
    return {store, history};
};

export type AppBrowserHistory = ReturnType<typeof createMainEntryStore>['history'];
export type StoreType = ReturnType<typeof createMainEntryStore>['store'];
export type AppDispatch = StoreType['dispatch'];
