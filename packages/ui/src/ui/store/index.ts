import {Store, applyMiddleware, compose, createStore} from 'redux';
// @ts-ignore
import {listenForHistoryChange} from 'redux-location-state';
import {createBrowserHistory} from 'history';
import thunkMiddleware from 'redux-thunk';

import getLocationMiddleware from '../state-url-mapping';
import {RootState, makeRootReducer} from './reducers';

const enhancedCompose =
    ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ as typeof compose) || compose;

function configureStore(history: ReturnType<typeof createBrowserHistory>) {
    const rootReducer = makeRootReducer();

    const {locationMiddleware, reducersWithLocation} = getLocationMiddleware(history, rootReducer);

    const middlewares = applyMiddleware(thunkMiddleware, locationMiddleware);

    return enhancedCompose(middlewares)(createStore)(reducersWithLocation);
}

export function createAppStore() {
    const history = createBrowserHistory();
    const store: Store<RootState, any> = configureStore(history);
    listenForHistoryChange(store, history);

    (window as any).appBrowserHistory = history;
    (window as any).store = store;
    return {store, history};
}

export type AppBrowserHistory = ReturnType<typeof createAppStore>['history'];
export type StoreType = ReturnType<typeof createAppStore>['store'];
