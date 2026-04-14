import React from 'react';
import type {
    MetaTableAutomaticModeSwitchParams,
    TYComponentsNavigationMetaConfig,
} from '@ytsaurus/components';
import {docsUrls} from '../../constants/docsUrls';
import AccountLink from '../../pages/accounts/AccountLink';
import TabletCellBundleLink from '../../pages/tablet_cell_bundles/TabletCellBundleLink';
import ChaosCellBundleLink from '../../pages/tablet_cell_bundles/ChaosCellBundleLink';
import UIFactory from '../../UIFactory';
import {renderDefaultMetaOperationLink} from './presets/defaultMetaOperationLink';
import AutomaticModeSwitch from '../../pages/navigation/content/Table/TableMeta/AutomaticModeSwitch';

/**
 * Partial {@link TYComponentsNavigationMetaConfig} for MetaTable presets / `makeMetaItems`.
 * Used where `table.meta` is built outside React (e.g. query-tracker `loadTableAttributesByPath`).
 */
export const ytComponentsNavigationMetaConfig: Partial<TYComponentsNavigationMetaConfig> = {
    docsUrls,
    renderMetaOperationLink: renderDefaultMetaOperationLink,
    renderMetaTableAutomaticModeSwitch: (params: MetaTableAutomaticModeSwitchParams) => (
        <AutomaticModeSwitch value={params.value} onEdit={params.onEdit} />
    ),
    SubjectCard: (props: Parameters<typeof UIFactory.renderSubjectCard>[0]) =>
        UIFactory.renderSubjectCard(props),
    AccountLink: (props: React.ComponentProps<typeof AccountLink>) => <AccountLink {...props} />,
    TabletCellBundleLink: (props: React.ComponentProps<typeof TabletCellBundleLink>) => (
        <TabletCellBundleLink {...props} />
    ),
    ChaosCellBundleLink: (props: React.ComponentProps<typeof ChaosCellBundleLink>) => (
        <ChaosCellBundleLink {...props} />
    ),
};
