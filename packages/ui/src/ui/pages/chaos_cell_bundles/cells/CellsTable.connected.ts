import type {ComponentProps} from 'react';
import {connect} from 'react-redux';

import CellsTable from '../../../pages/tablet_cell_bundles/cells/CellsTable';
import {setChaosActiveBundle, setChaosPartial} from '../../../store/actions/chaos_cell_bundles';
import type {RootState} from '../../../store/reducers';
import {getCluster} from '../../../store/selectors/global';
import {
    getChaosCellsSortState,
    getChaosCellsSorted,
    getChaosIsLoaded,
    getChaosIsLoading,
} from '../../../store/selectors/chaos_cell_bundles';
import {
    chaosActiveBundleLink,
    chaosAttributesPath,
    chaosCellNavigationLink,
} from '../../../utils/components/tablet-cells';

const columns: ComponentProps<typeof CellsTable>['columns'] = [
    'id',
    'bundle',
    'health',
    'peerAddress',
    'state',
    'actions',
];

const mapStateToProps = (state: RootState) => {
    return {
        cluster: getCluster(state),
        loading: getChaosIsLoading(state),
        loaded: getChaosIsLoaded(state),
        data: getChaosCellsSorted(state),
        sortState: getChaosCellsSortState(state),
        columns,
        activeBundleLink: chaosActiveBundleLink,
        attributesPath: chaosAttributesPath,
        cellNavigationLink: chaosCellNavigationLink,
    };
};

const mapDispatchToProps = {
    setTabletsPartial: setChaosPartial,
    setTabletsActiveBundle: setChaosActiveBundle,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CellsTable);
