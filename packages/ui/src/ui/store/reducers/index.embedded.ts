import {Reducer, combineReducers} from 'redux';

import {registerLocationParameters} from '../../store/location';
import type {PathParameters} from '../../store/location';

import forEach_ from 'lodash/forEach';

export function makeEmbeddedReducer<T extends Record<string, Reducer>>(
    appReducers: T,
    locationParams: Array<[string, PathParameters]>,
) {
    const rootReducer = combineReducers({...appReducers});
    forEach_(locationParams, ([path, params]) => {
        registerLocationParameters(path, params);
    });
    return rootReducer;
}
