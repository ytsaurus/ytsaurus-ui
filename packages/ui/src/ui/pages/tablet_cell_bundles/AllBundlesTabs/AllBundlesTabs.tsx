import React from 'react';
import {useRouteMatch} from 'react-router';

import Tabs from '../../../components/Tabs/Tabs';
import {Page} from '../../../constants';
import {TabletsTab} from '../../../constants/tablets';
import {UI_TAB_SIZE} from '../../../constants/global';
import {useSelector} from '../../../store/redux-hooks';
import {selectCluster} from '../../../store/selectors/global';
import {makeTabProps} from '../../../utils';
import i18n from '../i18n';

interface Props {
    className?: string;
}

export function AllBundlesTabs({className}: Props) {
    const match = useRouteMatch();
    const cluster = useSelector(selectCluster);

    return (
        <Tabs
            {...makeAllTabsProps(match.url, cluster)}
            className={className}
            routed
            routedPreserveLocation
            exactNavLink
            size={UI_TAB_SIZE}
        />
    );
}

function makeAllTabsProps(matchUrl: string, cluster: string) {
    const res = makeTabProps(matchUrl, {});
    res.items = [
        {
            value: Page.TABLET_CELL_BUNDLES,
            get text() {
                return i18n('title_tablet-cell-bundles');
            },
            show: true,
            url: `/${cluster}/${Page.TABLET_CELL_BUNDLES}`,
        },
        {
            value: TabletsTab.TABLET_CELLS,
            get text() {
                return i18n('title_tablet-cells');
            },
            show: true,
            url: `/${cluster}/${Page.TABLET_CELL_BUNDLES}/${TabletsTab.TABLET_CELLS}`,
        },
        {
            value: Page.CHAOS_CELL_BUNDLES,
            get text() {
                return i18n('title_chaos-cell-bundles');
            },
            show: true,
            url: `/${cluster}/${Page.CHAOS_CELL_BUNDLES}`,
        },
        {
            value: TabletsTab.CHAOS_CELLS,
            get text() {
                return i18n('title_chaos-cells');
            },
            show: true,
            url: `/${cluster}/${Page.CHAOS_CELL_BUNDLES}/${TabletsTab.CHAOS_CELLS}`,
        },
    ];
    return res;
}
