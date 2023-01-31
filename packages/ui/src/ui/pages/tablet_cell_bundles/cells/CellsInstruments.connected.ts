import {connect} from 'react-redux';

import CellsTableInstruments from '../../../pages/tablet_cell_bundles/cells/CellsInstruments';
import {setTabletsPartial} from '../../../store/actions/tablet_cell_bundles';
import type {RootState} from '../../../store/reducers';
import {
    getTabletsActiveBundle,
    getTabletsCellsBundleFilter,
    getTabletsCellsBundles,
    getTabletsCellsHostFilter,
    getTabletsCellsHosts,
    getTabletsCellsHostsOfActiveBundle,
    getTabletsCellsIdFilter,
} from '../../../store/selectors/tablet_cell_bundles';

const mapStateToProps = (state: RootState) => {
    return {
        activeBundle: getTabletsActiveBundle(state),
        activeBundleHosts: getTabletsCellsHostsOfActiveBundle(state),

        idFilter: getTabletsCellsIdFilter(state),
        bundleFilter: getTabletsCellsBundleFilter(state),
        hostFilter: getTabletsCellsHostFilter(state),

        bundles: getTabletsCellsBundles(state),
        hosts: getTabletsCellsHosts(state),
    };
};

const mapDispatchToProps = {
    setTabletsPartial,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CellsTableInstruments);
