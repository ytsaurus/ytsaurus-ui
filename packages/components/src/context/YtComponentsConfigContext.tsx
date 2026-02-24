import React, {createContext, useContext, useMemo} from 'react';

import type {ErrorBoundaryProps} from '../internal/DefaultErrorBoundary/ErrorBoundary';
import DefaultErrorBoundary from '../internal/DefaultErrorBoundary/ErrorBoundary';
import type {MetaTableItem} from '../components';
import {UnipikaSettings} from '../internal/Yson/StructuredYson/StructuredYsonTypes';

export type LogErrorParams = {message: string};
export type LogErrorFn = (params: LogErrorParams, error?: Error) => void;

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

type MetaTableAccountLinkProps = {
    className?: string;
    account?: string;
    cluster?: string;
    inline?: boolean;
};

type MetaTableTabletCellBundleLinkProps = {
    className?: string;
    tabletCellBundle?: string;
    cluster?: string;
    inline?: boolean;
};

type MetaTableChaosCellBundleLinkProps = {
    className?: string;
    chaosCellBundle?: string;
    cluster?: string;
    inline?: boolean;
};

export type YtComponentsDocsUrlKey = 'cypress:ttl' | 'storage:replication#erasure';

export type NavigationLinkTemplate = (params: {
    cluster?: string;
    path: string;
}) => string | undefined;

export type MetaTableOperationLinkParams = {
    operationId: string;
    cluster: string;
};

export type MetaTableAutomaticModeSwitchOnEdit = (currentValue?: boolean) => Promise<void>;

export type MetaTableAutomaticModeSwitchParams = {
    value?: boolean;
    cluster: string;
    onEdit?: MetaTableAutomaticModeSwitchOnEdit;
};

export type YtComponentsConfig = {
    ErrorBoundaryComponent?: React.ComponentType<ErrorBoundaryProps>;
    SubjectCard?: (props: SubjectCardProps) => React.ReactNode;
    AccountLink?: (props: MetaTableAccountLinkProps) => React.ReactNode;
    TabletCellBundleLink?: (props: MetaTableTabletCellBundleLinkProps) => React.ReactNode;
    ChaosCellBundleLink?: (props: MetaTableChaosCellBundleLinkProps) => React.ReactNode;
    renderMetaOperationLink?: (
        params: MetaTableOperationLinkParams,
    ) => MetaTableItem | MetaTableItem[] | null | undefined;
    renderMetaTableAutomaticModeSwitch?: (
        params: MetaTableAutomaticModeSwitchParams,
    ) => React.ReactNode;
    navigationLinkTemplate?: NavigationLinkTemplate;
    logError?: LogErrorFn;
    docsUrls?: Record<YtComponentsDocsUrlKey, string>;
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
    value?: YtComponentsConfig;
    errorBoundaryComponent?: React.ComponentType<ErrorBoundaryProps>;
    navigationLinkTemplate?: NavigationLinkTemplate;
    logError?: LogErrorFn;
    docsUrls?: Record<string, string>;
    unipika?: UnipikaSettings;
    children: React.ReactNode;
};

export const YtComponentsConfigProvider: React.FC<YtComponentsConfigProviderProps> = ({
    value,
    errorBoundaryComponent,
    navigationLinkTemplate,
    logError,
    docsUrls,
    unipika,
    children,
}) => {
    const contextValue = useMemo(
        () =>
            value ??
            (errorBoundaryComponent || navigationLinkTemplate || logError || docsUrls || unipika
                ? {
                      ...defaultConfig,
                      ...(errorBoundaryComponent && {
                          ErrorBoundaryComponent: errorBoundaryComponent,
                      }),
                      ...(navigationLinkTemplate && {navigationLinkTemplate}),
                      ...(logError && {logError}),
                      ...(docsUrls && {docsUrls}),
                      ...(unipika && {unipika: {...defaultUnipikaSettings, ...unipika}}),
                  }
                : defaultConfig),
        [value, errorBoundaryComponent, navigationLinkTemplate, logError, docsUrls, unipika],
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

export function useErrorBoundaryComponent(): React.ComponentType<ErrorBoundaryProps> {
    const config = useYtComponentsConfig();
    return config.ErrorBoundaryComponent ?? DefaultErrorBoundary;
}

export const ConfigurableErrorBoundary: React.FC<ErrorBoundaryProps> = ({children, onError}) => {
    const ErrorBoundaryComponent = useErrorBoundaryComponent();
    return <ErrorBoundaryComponent onError={onError}>{children}</ErrorBoundaryComponent>;
};
