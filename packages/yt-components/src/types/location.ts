export type LocationParameters = Record<string, ParameterDescription>;

interface ParameterDescription<T = any> {
    stateKey: string;
    initialState?: T;
    type?: string;
    options?: {
        isFlags?: boolean;
        parse?: (v: string) => T | undefined;
        serialize?: (v: T) => string | number | undefined;
        shouldPush?: boolean;
        delimiter?: string;
    };
}
