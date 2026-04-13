import type {ComponentProps} from 'react';
import {connect} from 'react-redux';

import CellsTable from '../../../pages/tablet_cell_bundles/cells/CellsTable';
import {setChaosActiveBundle, setChaosPartial} from '../../../store/actions/chaos_cell_bundles';
import type {RootState} from '../../../store/reducers';
import {selectCluster} from '../../../store/selectors/global';
import {
    selectChaosCellsSortState,
    selectChaosCellsSorted,
    selectChaosIsLoaded,
    selectChaosIsLoading,
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
        cluster: selectCluster(state),
        loading: selectChaosIsLoading(state),
        loaded: selectChaosIsLoaded(state),
        data: selectChaosCellsSorted(state),
        sortState: selectChaosCellsSortState(state),
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
