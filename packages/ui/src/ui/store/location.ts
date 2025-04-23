import {produce} from 'immer';
import isEmpty_ from 'lodash/isEmpty';
import {stateToParams} from 'redux-location-state/lib/stateToParams';

import {paramsToQuery} from '../utils';
import {updateByLocationParams} from '../utils/utils';
import {getWindowStore} from './window-store';

interface LocationWithState<T> {
    pathname: string;
    query: T;
}

const match = (path: string, locationPath: string) => {
    const allPathItems = locationPath.split('/');
    const initialDeclareditemSplit = path.split('/');
    const reducedInitialItem = [...initialDeclareditemSplit];
    let deleted = 0;

    initialDeclareditemSplit.forEach((split, index) => {
        // if the item has a * remove that query from both the match and the item to match
        if (split === '*') {
            allPathItems.splice(index - deleted, 1);
            reducedInitialItem.splice(index - deleted, 1);
            deleted++;
        }
    });

    // match the final strings sans wildcards against each other
    return allPathItems.join('/') === reducedInitialItem.join('/');
};

export type LocationParameters = Record<string, ParameterDescription>;

export type MapLocationToStateFn<T = any> = (state: T, location: LocationWithState<T>) => T;
interface ParameterDescription<T = any> {
    stateKey: string;
    initialState?: T;
    type?: string;
    options?: {
        isFlags?: boolean;
        parse?: (v: string) => T | undefined;
        serialize?: (v: T) => string | number | undefined;
        shouldPush?: boolean;
        delimiter?: string;
    };
}

export type PathParameters = [LocationParameters, MapLocationToStateFn] | [LocationParameters];

const storeSetup: Array<[string, PathParameters]> = [];

export function getParamSetup(): Record<string, LocationParameters> {
    const res = storeSetup.reduce(
        (acc, [key, [params]]) => {
            acc[key] = params;
            return acc;
        },
        {} as Record<string, LocationParameters>,
    );
    return res;
}

export function registerLocationParameters(path: string, data: PathParameters) {
    if (storeSetup.find(([setupPath]) => setupPath === path)) {
        throw new Error(`Location parameters already defined for path '${path}'.`);
    }
    const matchedInd = storeSetup.findIndex(([setupPath]) => match(setupPath, path));
    if (matchedInd !== -1) {
        storeSetup.splice(matchedInd, 0, [path, data]);
    } else {
        storeSetup.push([path, data]);
    }
}

export function mapLocationToState<T extends Object>(state: T, location: LocationWithState<T>) {
    const matchedState = storeSetup.find(([path]) => match(path, location.pathname));
    const findState = matchedState
        ? matchedState
        : storeSetup.find(([setupPath]) => setupPath === 'global');
    const locationSetup = findState?.[1] ?? [];
    if (!locationSetup) {
        return state;
    }

    const [params, applyToState] = locationSetup;
    if (applyToState) {
        return applyToState(state, location);
    }

    const {query} = location;
    return produce(state, (draft) => {
        return updateByLocationParams({draft, query}, params!);
    });
}

export function makeRoutedURLByPath(pathname: string, paramOverrides: any = {}, rootState?: any) {
    const {location} = stateToParams(getParamSetup(), rootState ?? getWindowStore().getState(), {
        pathname,
    });
    const {search} = location;
    const params = {...paramOverrides};
    new URLSearchParams(search).forEach((v, k) => {
        if (!(k in params)) {
            params[k] = v;
        }
    });
    const p = isEmpty_(params) ? '' : '?' + paramsToQuery(params);
    return `${pathname}${p}`;
}

export function makeRoutedURL(url: string, paramOverrides: any = {}, rootState?: any) {
    let path = url;
    const qIndex = url.indexOf('?');
    let overrides = paramOverrides;
    if (-1 !== qIndex) {
        path = url.substr(0, qIndex);
        overrides = {...paramOverrides};
        new URLSearchParams(url.substr(qIndex)).forEach((v, key) => {
            overrides[key] = v;
        });
    }
    const res = makeRoutedURLByPath(path, overrides, rootState);
    return res;
}

export type MakeRotedUrlFnType = typeof makeRoutedURL;

(window as any).makeRoutedURL = makeRoutedURL;
