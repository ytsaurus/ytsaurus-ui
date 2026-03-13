import React, {createContext, useContext, useMemo} from 'react';

import type {ErrorBoundaryProps} from '../components/DefaultErrorBoundary/ErrorBoundary';
import DefaultErrorBoundary from '../components/DefaultErrorBoundary/ErrorBoundary';

export type LogErrorParams = {message: string};
export type LogErrorFn = (params: LogErrorParams, error?: Error) => void;

export type UnipikaSettings = {
    /** When true, decode UTF-8 in strings (e.g. column names). Default true. */
    showDecoded?: boolean;
};

const defaultUnipikaSettings: UnipikaSettings = {
    showDecoded: true,
};

type SubjectCardProps = {
    className?: string;
    noLink?: boolean;
    showIcon?: boolean;
    internal?: boolean;
    url?: string;
    name: string | number;
    type?: 'user' | 'group' | 'tvm';
    groupType?: 'service' | 'department' | string;
};

export type YtComponentsConfig = {
    ErrorBoundaryComponent?: React.ComponentType<ErrorBoundaryProps>;
    SubjectCard?: (props: SubjectCardProps) => React.ReactNode;
    renderYqlOperationLink?: (yqlOperationId: string) => React.ReactNode;
    logError?: LogErrorFn;
    /** Map of doc keys to URLs (e.g. 'storage:replication#erasure' -> url). */
    docsUrls?: Record<string, string>;
    /** Unipika/display settings (e.g. showDecoded from app settings). */
    unipika?: UnipikaSettings;
};

/** @deprecated Use YtComponentsConfig */
export type NavigationTableConfig = YtComponentsConfig;

const defaultConfig: YtComponentsConfig = {
    logError: console.log,
    unipika: defaultUnipikaSettings,
};

const YtComponentsConfigContext = createContext<YtComponentsConfig>(defaultConfig);

export type YtComponentsConfigProviderProps = {
    /** Full config object. Optional if using shorthand props below. */
    value?: YtComponentsConfig;
    /** Shorthand: custom ErrorBoundary component. */
    errorBoundaryComponent?: React.ComponentType<ErrorBoundaryProps>;
    /** Shorthand: custom error logger. Default: console.log. */
    logError?: LogErrorFn;
    /** Shorthand: docs URLs (e.g. for meta presets). */
    docsUrls?: Record<string, string>;
    /** Unipika settings (e.g. showDecoded from app). */
    unipika?: UnipikaSettings;
    children: React.ReactNode;
};

/**
 * Single provider for yt-components config: ErrorBoundary, logError, docsUrls,
 * unipika settings (showDecoded), and optional SubjectCard/renderYqlOperationLink.
 * Wrap your app or the part where you use components from @ytsaurus/yt-components.
 */
export const YtComponentsConfigProvider: React.FC<YtComponentsConfigProviderProps> = ({
    value,
    errorBoundaryComponent,
    logError,
    docsUrls,
    unipika,
    children,
}) => {
    const contextValue = useMemo(
        () =>
            value ??
            (errorBoundaryComponent || logError || docsUrls || unipika
                ? {
                      ...defaultConfig,
                      ...(errorBoundaryComponent && {
                          ErrorBoundaryComponent: errorBoundaryComponent,
                      }),
                      ...(logError && {logError}),
                      ...(docsUrls && {docsUrls}),
                      ...(unipika && {unipika: {...defaultUnipikaSettings, ...unipika}}),
                  }
                : defaultConfig),
        [value, errorBoundaryComponent, logError, docsUrls, unipika],
    );
    return (
        <YtComponentsConfigContext.Provider value={contextValue}>
            {children}
        </YtComponentsConfigContext.Provider>
    );
};

export function useYtComponentsConfig(): YtComponentsConfig {
    return useContext(YtComponentsConfigContext);
}

export function useUnipikaSettings(): UnipikaSettings {
    const config = useYtComponentsConfig();
    return config.unipika ?? defaultUnipikaSettings;
}

/**
 * Returns the ErrorBoundary component to use: custom from config or default.
 */
export function useErrorBoundaryComponent(): React.ComponentType<ErrorBoundaryProps> {
    const config = useYtComponentsConfig();
    return config.ErrorBoundaryComponent ?? DefaultErrorBoundary;
}

/**
 * ErrorBoundary that respects YtComponentsConfigProvider (uses custom component if provided).
 * Use this inside the library instead of importing ErrorBoundary directly.
 */
export const ConfigurableErrorBoundary: React.FC<ErrorBoundaryProps> = ({children, onError}) => {
    const ErrorBoundaryComponent = useErrorBoundaryComponent();
    return <ErrorBoundaryComponent onError={onError}>{children}</ErrorBoundaryComponent>;
};
