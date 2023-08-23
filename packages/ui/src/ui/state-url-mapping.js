import {customEncodeURIComponent} from './utils/url-mapping';
import {parseQuery} from 'redux-location-state/lib/parseQuery';
import {LOCATION_POP, LOCATION_PUSH} from 'redux-location-state/lib/constants';

import {createReduxLocationActions, setParamEncoder} from 'redux-location-state';
import {getParamSetup, mapLocationToState} from './store/location';

setParamEncoder(customEncodeURIComponent);

function makeReducersWithLocation(setupObject, mapLocationToState, rootReducer) {
    function makeLocationReducer(setupObject, mapLocationToState) {
        return (state, action) => {
            const {type, payload} = action;
            if (!payload) {
                return state;
            }
            if (LOCATION_POP === type || LOCATION_PUSH === type) {
                payload.query = parseQuery(setupObject, payload);
                return mapLocationToState(state, payload);
            }
            return state;
        };
    }
    const locationReducer = makeLocationReducer(setupObject, mapLocationToState);

    return (state, action) => {
        const postReducerState = rootReducer(state, action);
        const postLocationState = locationReducer(postReducerState, action);
        const hasChanged = postLocationState !== state;
        return hasChanged ? postLocationState : state;
    };
}

export default function getLocationMiddleware(history, rootReducer) {
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
