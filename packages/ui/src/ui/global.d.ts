declare module '*.svg' {
    const content: SVGIconSvgrData;

    export default content;
}

declare module 'redux-location-state/lib/stateToParams' {
    export const stateToParams: any;
}

declare module 'redux-location-state/lib/constants' {
    export const LOCATION_POP: 'REDUX-LOCATION-POP-ACTION';
    export const LOCATION_PUSH: 'REDUX-LOCATION-PUSH-ACTION';
}

declare module 'redux-location-state/lib/parseQuery' {
    import {type Location} from 'history';

    export function parseQuery(
        setup: Record<string, object>,
        location: Pick<Location, 'pathname' | 'search'>,
    ): unknown;
}

declare module 'redux-location-state' {
    import {type History} from 'history';
    import {type Action, type Middleware, type Reducer} from 'redux';

    export function setParamEncoder(encoder: (value: string) => string): void;

    export function createReduxLocationActions<S extends object, A extends Action, P>(
        setup: Record<string, object>,
        locationMapper: (state: S, location: {pathname: string; query: S}) => S,
        history: History,
        rootReducer: Reducer<S, A, P>,
    ): {locationMiddleware: Middleware<{}, S>};
}
