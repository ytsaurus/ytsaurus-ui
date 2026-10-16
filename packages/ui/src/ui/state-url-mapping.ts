import {type History} from 'history';
import {type Action, type Reducer, type UnknownAction} from 'redux';
import {customEncodeURIComponent} from './utils/url-mapping';
import {parseQuery} from 'redux-location-state/lib/parseQuery';
import {LOCATION_POP, LOCATION_PUSH} from 'redux-location-state/lib/constants';

import {createReduxLocationActions, setParamEncoder} from 'redux-location-state';
import {type MapLocationToStateFn, getParamSetup, mapLocationToState} from './store/location';

setParamEncoder(customEncodeURIComponent);

type LocationAction = UnknownAction & {
    payload?: Pick<History['location'], 'pathname' | 'search'> & {query?: unknown};
};

function makeReducersWithLocation<S extends object, A extends Action, P>(
    setupObject: ReturnType<typeof getParamSetup>,
    locationMapper: MapLocationToStateFn<S>,
    rootReducer: Reducer<S, A, P>,
): Reducer<S, A, P> {
    function makeLocationReducer(
        config: ReturnType<typeof getParamSetup>,
        mapLocation: MapLocationToStateFn<S>,
    ) {
        return (state: S, action: LocationAction): S => {
            const {type, payload} = action;
            if (!payload) {
                return state;
            }
            if (LOCATION_POP === type || LOCATION_PUSH === type) {
                payload.query = parseQuery(config, payload);
                return mapLocation(state, payload as Parameters<MapLocationToStateFn<S>>[1]);
            }
            return state;
        };
    }
    const locationReducer = makeLocationReducer(setupObject, locationMapper);

    return (state, action) => {
        const postReducerState = rootReducer(state, action);
        const postLocationState = locationReducer(postReducerState, action as A & LocationAction);
        return postLocationState;
    };
}

export default function getLocationMiddleware<S extends object, A extends Action, P>(
    history: History,
    rootReducer: Reducer<S, A, P>,
) {
    const {locationMiddleware} = createReduxLocationActions(
        getParamSetup(),
        mapLocationToState,
        history,
        rootReducer,
    );
    const reducersWithLocation = makeReducersWithLocation(
        getParamSetup(),
        mapLocationToState,
        rootReducer,
    );
    return {locationMiddleware, reducersWithLocation};
}
