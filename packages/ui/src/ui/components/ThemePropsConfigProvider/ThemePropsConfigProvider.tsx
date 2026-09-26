import React, {type ReactNode, createContext, useContext} from 'react';

import {type ButtonView} from '@gravity-ui/uikit';

export type ButtonActionRole = 'primary' | 'secondary' | 'modal';

type ButtonThemePropsResolverParams = {
    actionRole?: ButtonActionRole;
    view?: ButtonView;
};

type ButtonThemePropsResolverResult = {
    className?: string;
    view?: ButtonView;
};

export type ThemePropsConfig = Partial<{
    button: (resolverParams: ButtonThemePropsResolverParams) => ButtonThemePropsResolverResult;
}>;

type ThemePropsComponentName = keyof ThemePropsConfig;

type ThemePropsResolver<T extends ThemePropsComponentName> = Required<ThemePropsConfig>[T];

const defaultThemePropsConfig: ThemePropsConfig = {};

const ThemePropsConfigContext = createContext(defaultThemePropsConfig);

type ThemePropsConfigProviderProps = {
    children: ReactNode;
    value: ThemePropsConfig | null;
};

export const ThemePropsConfigProvider = ({children, value}: ThemePropsConfigProviderProps) => {
    return (
        <ThemePropsConfigContext.Provider value={value ?? defaultThemePropsConfig}>
            {children}
        </ThemePropsConfigContext.Provider>
    );
};

export const useThemeProps = <T extends ThemePropsComponentName>(
    componentName: T,
    resolverParams: Parameters<ThemePropsResolver<T>>[0],
): ReturnType<ThemePropsResolver<T>> => {
    const config = useContext(ThemePropsConfigContext);
    const resolver = config[componentName] as ThemePropsResolver<T> | undefined;

    return (resolver?.(resolverParams) ?? {}) as ReturnType<ThemePropsResolver<T>>;
};
