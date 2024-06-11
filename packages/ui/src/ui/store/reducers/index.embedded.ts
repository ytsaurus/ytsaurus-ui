import {combineReducers} from 'redux';

import {PathParameters, registerLocationParameters} from '../../store/location';
import _ from 'lodash';

export function makeEmbeddedReducer<T extends Parameters<typeof combineReducers>[0]>(
    appReducers: T,
    locationParams: Array<[string, PathParameters]>,
) {
    const rootReducer = combineReducers({...appReducers});
    _.forEach(locationParams, ([path, params]) => {
        registerLocationParameters(path, params);
    });
    return rootReducer;
}
