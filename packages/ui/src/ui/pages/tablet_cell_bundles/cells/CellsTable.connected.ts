import type {ComponentProps} from 'react';
import {connect} from 'react-redux';

import CellsTable from '../../../pages/tablet_cell_bundles/cells/CellsTable';
import {
    setTabletsActiveBundle,
    setTabletsPartial,
} from '../../../store/actions/tablet_cell_bundles';
import type {RootState} from '../../../store/reducers';
import {selectCluster} from '../../../store/selectors/global';
import {
    selectTabletsCellsSortState,
    selectTabletsCellsSorted,
    selectTabletsIsLoaded,
    selectTabletsIsLoading,
} from '../../../store/selectors/tablet_cell_bundles';
import {
    tabletActiveBundleLink,
    tabletAttributesPath,
    tabletCellNavigationLink,
} from '../../../utils/components/tablet-cells';

const columns: ComponentProps<typeof CellsTable>['columns'] = [
    'id',
    'bundle',
    'health',
    'tablets',
    'memory',
    'uncompressed',
    'compressed',
    'peerAddress',
    'state',
    'actions',
];

const mapStateToProps = (state: RootState) => {
    return {
        cluster: selectCluster(state),
        loading: selectTabletsIsLoading(state),
        loaded: selectTabletsIsLoaded(state),
        data: selectTabletsCellsSorted(state),
        sortState: selectTabletsCellsSortState(state),
        columns,
        activeBundleLink: tabletActiveBundleLink,
        attributesPath: tabletAttributesPath,
        cellNavigationLink: tabletCellNavigationLink,
    };
};

const mapDispatchToProps = {
    setTabletsPartial,
    setTabletsActiveBundle,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CellsTable);
