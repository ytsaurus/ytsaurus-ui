import {connect} from 'react-redux';

import CellsTableInstruments from '../../../pages/tablet_cell_bundles/cells/CellsInstruments';
import {setChaosPartial} from '../../../store/actions/chaos_cell_bundles';
import type {RootState} from '../../../store/reducers';
import {
    getChaosActiveBundle,
    getChaosCellsBundleFilter,
    getChaosCellsBundles,
    getChaosCellsHostFilter,
    getChaosCellsHosts,
    getChaosCellsHostsOfActiveBundle,
    getChaosCellsIdFilter,
} from '../../../store/selectors/chaos_cell_bundles';

const mapStateToProps = (state: RootState) => {
    return {
        activeBundle: getChaosActiveBundle(state),
        activeBundleHosts: getChaosCellsHostsOfActiveBundle(state),

        idFilter: getChaosCellsIdFilter(state),
        bundleFilter: getChaosCellsBundleFilter(state),
        hostFilter: getChaosCellsHostFilter(state),

        bundles: getChaosCellsBundles(state),
        hosts: getChaosCellsHosts(state),
    };
};

const mapDispatchToProps = {
    setTabletsPartial: setChaosPartial,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CellsTableInstruments);
