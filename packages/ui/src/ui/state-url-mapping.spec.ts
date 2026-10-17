import {createMemoryHistory} from 'history';
import {type Reducer} from 'redux';
import {LOCATION_POP, LOCATION_PUSH} from 'redux-location-state/lib/constants';

import getLocationMiddleware from './state-url-mapping';

jest.mock('./store/location', () => ({
    getParamSetup: () => ({
        global: {count: {stateKey: 'count', type: 'number', initialState: 0}},
    }),
    mapLocationToState: (state: object, location: {query: object}) => ({
        ...state,
        ...location.query,
    }),
}));

const initialState = {count: 0, reduced: false};
const rootReducer: Reducer<typeof initialState> = (state = initialState, action) =>
    action.type === LOCATION_POP || action.type === LOCATION_PUSH
        ? {...state, reduced: true}
        : state;

function makeReducer() {
    return getLocationMiddleware(createMemoryHistory(), rootReducer).reducersWithLocation;
}

describe('state-url-mapping', () => {
    it.each([LOCATION_POP, LOCATION_PUSH])('maps query after the root reducer for %s', (type) => {
        const payload = {pathname: '/', search: '?count=7'};

        expect(makeReducer()(initialState, {type, payload})).toEqual({count: 7, reduced: true});
        expect(payload).toHaveProperty('query', {count: 7});
    });

    it('initializes state through the root reducer', () => {
        expect(makeReducer()(undefined, {type: 'INIT'})).toBe(initialState);
    });

    it('preserves the state reference for an unrelated action with a payload', () => {
        const payload = {pathname: '/', search: '?count=7'};

        expect(makeReducer()(initialState, {type: 'OTHER', payload})).toBe(initialState);
        expect(payload).not.toHaveProperty('query');
    });

    it('keeps root reducer changes when a location action has no payload', () => {
        expect(makeReducer()(initialState, {type: LOCATION_POP})).toEqual({
            count: 0,
            reduced: true,
        });
    });
});
