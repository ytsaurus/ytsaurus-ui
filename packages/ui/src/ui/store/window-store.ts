import {type AppBrowserHistory, type StoreType} from './store.main';
import {type MakeRotedUrlFnType} from './location';
import {
    type CombinedSliceReducer,
    type Slice,
    type SliceCaseReducers,
    type SliceSelectors,
} from '@reduxjs/toolkit';
import {type RootState} from './reducers';

export function getWindowStore(): StoreType {
    return (window as any).store;
}

export const makeRoutedURL: MakeRotedUrlFnType = (...args) =>
    (window as any).makeRoutedURL(...args);

export function getAppBrowserHistory(): AppBrowserHistory {
    return (window as any).appBrowserHistory;
}

export function injectReducers<
    K extends string,
    SS,
    SCR extends SliceCaseReducers<SS>,
    N extends string,
    Selectors extends SliceSelectors<SS>,
>(reducerPath: K, slice: Slice<SS, SCR, N, K, Selectors>) {
    if ((getWindowStore().getState() as any)[reducerPath] !== undefined) {
        throw new Error(`Unexpected behavior: state['${reducerPath}'] is already defined`);
    }

    const {rootReducer} = getWindowStore() as any;
    const injectedSlice = slice.injectInto(rootReducer as CombinedSliceReducer<RootState>, {
        reducerPath,
    });
    getWindowStore().replaceReducer(rootReducer);
    getAppBrowserHistory().replace(
        makeRoutedURL(window.location.pathname, {}, (getWindowStore() as any).initialState),
    );
    return injectedSlice;
}

export function nameAndInitialState<K extends string, SliceState>(
    reducerPath: K,
    initialState: SliceState,
) {
    return {
        name: reducerPath,
        initialState: {
            ...initialState,
            ...(getWindowStore() as any).initialState[reducerPath],
        } as SliceState,
    };
}
