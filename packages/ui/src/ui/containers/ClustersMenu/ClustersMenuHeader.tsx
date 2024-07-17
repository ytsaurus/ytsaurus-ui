import React from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import {ConnectedProps, connect} from 'react-redux';

import Filter from '../../components/Filter/Filter';
import RadioButton from '../../components/RadioButton/RadioButton';
import {updateFilter, updateViewMode} from '../../store/actions/clusters-menu';
import {HeaderLinks} from '../../containers/ClustersMenu/HeaderLinks';
import {LINKS_ITEM_CLUSTERS} from '../../containers/ClustersMenu/header-links-items';
import {RootState} from '../../store/reducers';

import './ClusterMenuHeader.scss';

const b = block('cluster-menu');

ClustersMenuHeader.propTypes = {
    clusterFilter: PropTypes.string,
    viewMode: PropTypes.oneOf(['dashboard', 'table']).isRequired,
    updateFilter: PropTypes.func.isRequired,
    updateViewMode: PropTypes.func.isRequired,
    login: PropTypes.string,
};

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
                    <RadioButton<'table' | 'dashboard'>
                        size="m"
                        name="cluster-menu-mode"
                        value={viewMode}
                        onUpdate={(value) => updateViewMode(value)}
                        items={[
                            {
                                value: 'table',
                                text: '',
                                icon: {awesome: 'list'},
                            },
                            {
                                value: 'dashboard',
                                text: '',
                                icon: {awesome: 'table'},
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
