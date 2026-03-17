import React, {useEffect, useMemo} from 'react';
import {useSelector} from '../../store/redux-hooks';
import {getSettingsData} from '../../store/selectors/settings/settings-base';
import {
    YtComponentsConfigProvider as Provider,
    YtComponentsConfig,
    setLang as setComponentsLang,
} from '@ytsaurus/components';
import type {ErrorBoundaryProps as ComponentsErrorBoundaryProps} from '../../components/ErrorBoundary/ErrorBoundary';
import {makeNavigationLink} from '../../utils/app-url';
import {getYsonSettingsDisableDecode} from '../../store/selectors/thor/unipika';
import {docsUrls} from '../../constants/docsUrls';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import AccountLink from '../../pages/accounts/AccountLink';
import TabletCellBundleLink from '../../pages/tablet_cell_bundles/TabletCellBundleLink';
import ChaosCellBundleLink from '../../pages/tablet_cell_bundles/ChaosCellBundleLink';
import UIFactory from '../../UIFactory';
import {rumLogError} from '../../rum/rum-counter';
import {renderDefaultMetaOperationLink} from '../../components/MetaTable/presets/defaultMetaOperationLink';
import AutomaticModeSwitch from '../../pages/navigation/content/Table/TableMeta/AutomaticModeSwitch';

function UIErrorBoundaryAdapter(props: ComponentsErrorBoundaryProps) {
    return <ErrorBoundary onError={props.onError}>{props.children}</ErrorBoundary>;
}

export function YtComponentsConfigProvider({children}: {children: React.ReactNode}) {
    const ysonSettings = useSelector(getYsonSettingsDisableDecode);
    const locale = useSelector(getSettingsData)['global::lang'] ?? 'en';

    useEffect(() => {
        setComponentsLang(locale);
    }, [locale]);

    const value = useMemo<YtComponentsConfig>(
        () => ({
            logError: rumLogError,
            unipika: ysonSettings,
            navigationLinkTemplate: ({cluster, path}) => makeNavigationLink({path, cluster}),
            docsUrls,
            ErrorBoundaryComponent: UIErrorBoundaryAdapter,
            renderMetaOperationLink: renderDefaultMetaOperationLink,
            renderMetaTableAutomaticModeSwitch: (params) => (
                <AutomaticModeSwitch value={params.value} onEdit={params.onEdit} />
            ),
            SubjectCard: (props: Parameters<typeof UIFactory.renderSubjectCard>[0]) =>
                UIFactory.renderSubjectCard(props),
            AccountLink: (props: React.ComponentProps<typeof AccountLink>) => (
                <AccountLink {...props} />
            ),
            TabletCellBundleLink: (props: React.ComponentProps<typeof TabletCellBundleLink>) => (
                <TabletCellBundleLink {...props} />
            ),
            ChaosCellBundleLink: (props: React.ComponentProps<typeof ChaosCellBundleLink>) => (
                <ChaosCellBundleLink {...props} />
            ),
        }),
        [ysonSettings],
    );

    return <Provider value={value}>{children}</Provider>;
}
