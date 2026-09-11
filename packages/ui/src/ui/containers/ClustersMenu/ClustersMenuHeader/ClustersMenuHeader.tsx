import {connect} from 'react-redux';
import {updateFilter, updateViewMode} from '../../../store/actions/clusters-menu';
import {type RootState} from '../../../store/reducers';

import '../ClusterMenuHeader.scss';

import {ClustersMenuHeaderBase} from './ClustersMenuHeaderBase';

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

export const ClustersMenuHeader = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ClustersMenuHeaderBase);
