import React from 'react';
import {useRouteMatch} from 'react-router';

import Tabs from '../../../components/Tabs/Tabs';
import {TabletsTab} from '../../../constants/tablets';
import {UI_TAB_SIZE} from '../../../constants/global';
import {makeTabProps} from '../../../utils';
import {AllBundlesTabs} from '../../tablet_cell_bundles/AllBundlesTabs/AllBundlesTabs';
import i18n from '../../tablet_cell_bundles/i18n';

interface ChaosBundlesTabsProps {
    className?: string;
    activeBundle: string | undefined;
    hasMonitoring: boolean;
}

export function ChaosBundlesTabs({className, activeBundle, hasMonitoring}: ChaosBundlesTabsProps) {
    const match = useRouteMatch();

    if (!activeBundle) {
        return <AllBundlesTabs className={className} />;
    }

    const tabProps = makeTabProps(
        match.url,
        {CHAOS_CELLS: TabletsTab.CHAOS_CELLS, MONITOR: TabletsTab.MONITOR},
        {
            [TabletsTab.CHAOS_CELLS]: {show: true},
            [TabletsTab.MONITOR]: {show: hasMonitoring},
        },
        undefined,
        {
            [TabletsTab.CHAOS_CELLS]: i18n('title_chaos-cells'),
            [TabletsTab.MONITOR]: i18n('title_monitoring'),
        },
    );

    return (
        <Tabs
            {...tabProps}
            className={className}
            routed
            routedPreserveLocation
            exactNavLink
            size={UI_TAB_SIZE}
        />
    );
}
