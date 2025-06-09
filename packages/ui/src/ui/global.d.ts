declare module '*.svg' {
    const content: SVGIconSvgrData;

    export default content;
}

declare module 'redux-location-state/lib/stateToParams' {
    export const stateToParams: any;
}
