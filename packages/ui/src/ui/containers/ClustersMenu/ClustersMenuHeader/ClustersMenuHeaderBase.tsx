import React from 'react';
import block from 'bem-cn-lite';
import {LayoutCellsLarge, ListUl} from '@gravity-ui/icons';
import {Icon, SegmentedRadioGroup} from '@gravity-ui/uikit';

import Filter from '../../../components/Filter/Filter';
import {HeaderLinks} from '../HeaderLinks';
import {LINKS_ITEM_CLUSTERS} from '../header-links-items';
import {type ClustersMenuState} from '../../../store/reducers/clusters-menu/clusters-menu';
import i18n from '../i18n';

const b = block('cluster-menu');

type Props = {
    viewMode: 'dashboard' | 'table';
    clusterFilter: string;
    login: string;
    updateViewMode: (viewMode: ClustersMenuState['viewMode']) => void;
    updateFilter: (clusterFilter: ClustersMenuState['clusterFilter']) => void;
};

export function ClustersMenuHeaderBase({
    viewMode,
    updateViewMode,
    clusterFilter,
    updateFilter,
}: Props) {
    return (
        <header className={b('header', 'elements-page__header')}>
            <div className={b('header-inner')}>
                <div className={b('filter')}>
                    <div className="elements-filter">
                        <Filter
                            value={clusterFilter}
                            placeholder={i18n('field_filter-clusters')}
                            onChange={updateFilter}
                        />
                    </div>
                </div>
                <div className={b('view')}>
                    <SegmentedRadioGroup<'table' | 'dashboard'>
                        size="m"
                        name="cluster-menu-mode"
                        value={viewMode}
                        onUpdate={(value: 'table' | 'dashboard') => updateViewMode(value)}
                        options={[
                            {
                                value: 'table',
                                content: <Icon data={ListUl} size={13} />,
                            },
                            {
                                value: 'dashboard',
                                content: <Icon data={LayoutCellsLarge} size={13} />,
                            },
                        ]}
                    />
                </div>

                <HeaderLinks currentUrl={LINKS_ITEM_CLUSTERS.href} />
            </div>
        </header>
    );
}
