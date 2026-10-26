import {configureStore} from '@reduxjs/toolkit';
import type {Action} from 'redux';

import {startFlowStoryRouting} from './flow-story-routing';

jest.mock('../state-url-mapping', () => ({
    __esModule: true,
    default: (_history: unknown, rootReducer: unknown) => ({
        locationMiddleware: () => (next: (action: unknown) => unknown) => next,
        reducersWithLocation: rootReducer,
    }),
}));
jest.mock('./api', () => ({
    rootApi: {middleware: () => (next: (action: unknown) => unknown) => next},
}));
jest.mock('./location', () => ({
    getParamSetup: () => ({}),
    registerLocationParameters: () => {},
}));
jest.mock('./reducers/flow/url-mapping', () => ({flowParams: {}, flowStateLocations: []}));
jest.mock('./reducers/index.main', () => ({
    appReducers: {
        locations: (
            state: Array<string> = [],
            action: Action & {payload?: {pathname: string; search: string}},
        ) =>
            action.payload?.pathname
                ? [...state, `${action.type}:${action.payload.pathname}${action.payload.search}`]
                : state,
    },
}));

const POP = 'REDUX-LOCATION-POP-ACTION';
const PUSH = 'REDUX-LOCATION-PUSH-ACTION';

function createOuterStore() {
    return configureStore({reducer: (state: object = {}) => state});
}

describe('startFlowStoryRouting', () => {
    beforeEach(() => {
        Object.assign(window, {store: undefined, appBrowserHistory: undefined});
    });

    it('syncs the url-synced store with the initial entry and later navigation', () => {
        const {routing} = startFlowStoryRouting({
            initialEntries: ['/c/flows/p?flowTab=states'],
            outerStore: createOuterStore(),
            urlSync: true,
        });
        routing.history.push('/c/flows/p?flowTab=graph');
        routing.history.goBack();

        expect(routing.store.getState().locations).toEqual([
            `${POP}:/c/flows/p?flowTab=states`,
            `${PUSH}:/c/flows/p?flowTab=graph`,
            `${POP}:/c/flows/p?flowTab=states`,
        ]);
        expect(window).toMatchObject({store: routing.store, appBrowserHistory: routing.history});
    });

    it('stops following navigation and restores window refs after stop', () => {
        const previousStore = createOuterStore();
        Object.assign(window, {store: previousStore, appBrowserHistory: undefined});
        const {routing, stop} = startFlowStoryRouting({
            initialEntries: ['/c/flows/p'],
            outerStore: createOuterStore(),
            urlSync: true,
        });

        stop();
        routing.history.push('/c/flows/p?flowTab=graph');

        expect(routing.store.getState().locations).toEqual([`${POP}:/c/flows/p`]);
        expect(window).toMatchObject({store: previousStore, appBrowserHistory: undefined});
    });

    it('keeps window refs owned by a later routing on stop', () => {
        const first = startFlowStoryRouting({outerStore: createOuterStore(), urlSync: true});
        const second = startFlowStoryRouting({outerStore: createOuterStore(), urlSync: true});

        first.stop();

        expect(window).toMatchObject({
            store: second.routing.store,
            appBrowserHistory: second.routing.history,
        });
    });

    it('routes over the outer store without location sync when urlSync is off', () => {
        const outerStore = createOuterStore();
        const {routing} = startFlowStoryRouting({
            initialEntries: ['/c/flows/p'],
            outerStore,
            urlSync: false,
        });
        routing.history.push('/c/flows/p?flowTab=graph');

        expect(routing.store).toBe(outerStore);
        expect(routing.history.location.search).toBe('?flowTab=graph');
        expect(window).toMatchObject({store: outerStore, appBrowserHistory: routing.history});
    });
});
