import {connect} from 'react-redux';
import {
    fetchClusterAuthStatus,
    fetchClusterAvailability,
    fetchClusterVersions,
} from '../../../store/actions/clusters-menu';
import {CLUSTER_MENU_TABLE_ID} from '../../../constants/tables';
import '../ClusterMenuBody.scss';
import {type RootState} from '../../../store/reducers';

import {ClustersMenuBodyBase} from './ClustersMenuBodyBase';

function mapStateToProps(state: RootState) {
    const {viewMode, clusterFilter, clusters} = state.clustersMenu;
    return {
        viewMode,
        clusterFilter,
        clusters,
        sortState: state.tables[CLUSTER_MENU_TABLE_ID],
    };
}

const mapDispatchToProps = {
    fetchClusterVersions,
    fetchClusterAuthStatus,
    fetchClusterAvailability,
};

export const ClustersMenuBody = connect(mapStateToProps, mapDispatchToProps)(ClustersMenuBodyBase);
