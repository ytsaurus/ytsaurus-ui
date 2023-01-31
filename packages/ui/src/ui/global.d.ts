declare module '*.svg' {
    const content: SVGIconData;

    export default content;
}

declare module 'redux-location-state/lib/stateToParams' {
    export const stateToParams: any;
}
