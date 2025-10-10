import React from 'react';
import block from 'bem-cn-lite';
import {ConnectedProps, connect} from 'react-redux';
import {LayoutCellsLarge, ListUl} from '@gravity-ui/icons';
import {Icon, SegmentedRadioGroup} from '@gravity-ui/uikit';

import Filter from '../../components/Filter/Filter';
import {updateFilter, updateViewMode} from '../../store/actions/clusters-menu';
import {HeaderLinks} from '../../containers/ClustersMenu/HeaderLinks';
import {LINKS_ITEM_CLUSTERS} from '../../containers/ClustersMenu/header-links-items';
import {RootState} from '../../store/reducers';

import './ClusterMenuHeader.scss';

const b = block('cluster-menu');

type Props = ConnectedProps<typeof connector>;

function ClustersMenuHeader({viewMode, updateViewMode, clusterFilter, updateFilter}: Props) {
    return (
        <header className={b('header', 'elements-page__header')}>
            <div className={b('header-inner')}>
                <div className={b('filter')}>
                    <div className="elements-filter">
                        <Filter
                            value={clusterFilter}
                            placeholder="Filter clusters"
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

function mapStateToProps(state: RootState) {
    const {viewMode, clusterFilter} = state.clustersMenu;
    const {login} = state.global;
    return {
        viewMode,
        clusterFilter,
        login,
    };
}

const mapDispatchToProps = {
    updateViewMode,
    updateFilter,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(ClustersMenuHeader);
