import {
    customEncodeURIComponent,
    safeDecodeURIComponent,
    splitQueryParam,
} from './utils/url-mapping';
import {parseQuery} from 'redux-location-state/lib/parseQuery';
import {LOCATION_POP, LOCATION_PUSH} from 'redux-location-state/lib/constants';
import {RLSCONFIG} from 'redux-location-state/lib/helpers';

import {createReduxLocationActions, setParamDecoder, setParamEncoder} from 'redux-location-state';
import {getParamSetup, mapLocationToState} from './store/location';

setParamEncoder(customEncodeURIComponent);
setParamDecoder(safeDecodeURIComponent);

function getSetupObject() {
    return {...getParamSetup(), [RLSCONFIG]: {queryParser: splitQueryParam}};
}

function makeReducersWithLocation(setupObject, locationMapper, rootReducer) {
    function makeLocationReducer(config, mapLocation) {
        return (state, action) => {
            const {type, payload} = action;
            if (!payload) {
                return state;
            }
            if (LOCATION_POP === type || LOCATION_PUSH === type) {
                payload.query = parseQuery(config, payload);
                return mapLocation(state, payload);
            }
            return state;
        };
    }
    const locationReducer = makeLocationReducer(setupObject, locationMapper);

    return (state, action) => {
        const postReducerState = rootReducer(state, action);
        const postLocationState = locationReducer(postReducerState, action);
        const hasChanged = postLocationState !== state;
        return hasChanged ? postLocationState : state;
    };
}

export default function getLocationMiddleware(history, rootReducer) {
    const setupObject = getSetupObject();
    const {locationMiddleware} = createReduxLocationActions(
        setupObject,
        mapLocationToState,
        history,
        rootReducer,
    );
    const reducersWithLocation = makeReducersWithLocation(
        setupObject,
        mapLocationToState,
        rootReducer,
    );
    return {locationMiddleware, reducersWithLocation};
}
