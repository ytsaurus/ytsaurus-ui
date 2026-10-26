declare module '*.svg' {
    const content: SVGIconSvgrData;

    export default content;
}

declare module 'redux-location-state/lib/stateToParams' {
    export const stateToParams: any;
}

declare module 'redux-location-state/lib/listenForHistoryChange' {
    export const listenForHistoryChange: (store: unknown, history: unknown) => void;
}

declare module 'redux-location-state/lib/helpers' {
    export const RLSCONFIG: string;
    export const createParamsString: (params: Record<string, unknown>) => string;
    export const parseParams: (
        query: string | undefined,
        customParser?: (queryParam: string) => Array<string>,
    ) => Record<string, string>;
    export const setParamDecoder: (decoder: (value: string) => string) => void;
    export const setParamEncoder: (encoder: (value: string) => string) => void;
}
