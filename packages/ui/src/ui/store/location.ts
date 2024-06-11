import _ from 'lodash';
import {stateToParams} from 'redux-location-state/lib/stateToParams';

import {paramsToQuery} from '../utils';
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

    _.each(initialDeclareditemSplit, (split, index) => {
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

export type PathParameters = [LocationParameters, MapLocationToStateFn];

const storeSetup: Array<[string, PathParameters]> = [];

export function getParamSetup(): Record<string, LocationParameters> {
    const res = _.reduce(
        storeSetup,
        (acc, [key, [params]]) => {
            acc[key] = params;
            return acc;
        },
        {} as Record<string, LocationParameters>,
    );
    return res;
}

export function registerLocationParameters(path: string, data: PathParameters) {
    if (_.find(storeSetup, ([setupPath]) => setupPath === path)) {
        throw new Error(`Location parameters already defined for path '${path}'.`);
    }
    const matchedInd = _.findIndex(storeSetup, ([setupPath]) => match(setupPath, path));
    if (matchedInd !== -1) {
        storeSetup.splice(matchedInd, 0, [path, data]);
    } else {
        storeSetup.push([path, data]);
    }
}

export function mapLocationToState<T>(state: T, location: LocationWithState<T>) {
    const matchedState = _.find(storeSetup, ([path]) => match(path, location.pathname));
    const findState = matchedState
        ? matchedState
        : _.find(storeSetup, ([setupPath]) => setupPath === 'global');
    state = findState ? findState[1][1](state, location) : state;
    return state;
}

function makeRoutedURLByPath(pathname: string, paramOverrides: any = {}) {
    const {location} = stateToParams(getParamSetup(), getWindowStore().getState(), {
        pathname,
    });
    const {search} = location;
    const params = {...paramOverrides};
    new URLSearchParams(search).forEach((v, k) => {
        if (!_.has(params, k)) {
            params[k] = v;
        }
    });
    const p = _.isEmpty(params) ? '' : '?' + paramsToQuery(params);
    return `${pathname}${p}`;
}

export function makeRoutedURL(url: string, paramOverrides: any = {}) {
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
    const res = makeRoutedURLByPath(path, overrides);
    return res;
}

export type MakeRotedUrlFnType = typeof makeRoutedURL;

(window as any).makeRoutedURL = makeRoutedURL;
