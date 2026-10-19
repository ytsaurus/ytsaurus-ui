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

function makeReducersWithLocation<TState extends object, TAction extends Action, TPreloadedState>(
    setupObject: ReturnType<typeof getParamSetup>,
    locationMapper: MapLocationToStateFn<TState>,
    rootReducer: Reducer<TState, TAction, TPreloadedState>,
): Reducer<TState, TAction, TPreloadedState> {
    function makeLocationReducer(
        config: ReturnType<typeof getParamSetup>,
        mapLocation: MapLocationToStateFn<TState>,
    ) {
        return (state: TState, action: LocationAction): TState => {
            const {type, payload} = action;
            if (!payload) {
                return state;
            }
            if (LOCATION_POP === type || LOCATION_PUSH === type) {
                payload.query = parseQuery(config, payload);
                return mapLocation(state, payload as Parameters<MapLocationToStateFn<TState>>[1]);
            }
            return state;
        };
    }
    const locationReducer = makeLocationReducer(setupObject, locationMapper);

    return (state, action) => {
        const postReducerState = rootReducer(state, action);
        const postLocationState = locationReducer(
            postReducerState,
            action as TAction & LocationAction,
        );
        return postLocationState;
    };
}

export default function getLocationMiddleware<
    TState extends object,
    TAction extends Action,
    TPreloadedState,
>(history: History, rootReducer: Reducer<TState, TAction, TPreloadedState>) {
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
