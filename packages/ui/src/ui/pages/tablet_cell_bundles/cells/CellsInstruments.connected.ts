import {connect} from 'react-redux';

import CellsTableInstruments from '../../../pages/tablet_cell_bundles/cells/CellsInstruments';
import {setTabletsPartial} from '../../../store/actions/tablet_cell_bundles';
import type {RootState} from '../../../store/reducers';
import {
    selectTabletsActiveBundle,
    selectTabletsCellsBundleFilter,
    selectTabletsCellsBundles,
    selectTabletsCellsHostFilter,
    selectTabletsCellsHosts,
    selectTabletsCellsHostsOfActiveBundle,
    selectTabletsCellsIdFilter,
} from '../../../store/selectors/tablet_cell_bundles';

const mapStateToProps = (state: RootState) => {
    return {
        activeBundle: selectTabletsActiveBundle(state),
        activeBundleHosts: selectTabletsCellsHostsOfActiveBundle(state),

        idFilter: selectTabletsCellsIdFilter(state),
        bundleFilter: selectTabletsCellsBundleFilter(state),
        hostFilter: selectTabletsCellsHostFilter(state),

        bundles: selectTabletsCellsBundles(state),
        hosts: selectTabletsCellsHosts(state),
    };
};

const mapDispatchToProps = {
    setTabletsPartial,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CellsTableInstruments);
