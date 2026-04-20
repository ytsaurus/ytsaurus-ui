import {connect} from 'react-redux';

import CellsTableInstruments from '../../../pages/tablet_cell_bundles/cells/CellsInstruments';
import {setChaosPartial} from '../../../store/actions/chaos_cell_bundles';
import {type RootState} from '../../../store/reducers';
import {
    selectChaosActiveBundle,
    selectChaosCellsBundleFilter,
    selectChaosCellsBundles,
    selectChaosCellsHostFilter,
    selectChaosCellsHosts,
    selectChaosCellsHostsOfActiveBundle,
    selectChaosCellsIdFilter,
} from '../../../store/selectors/chaos_cell_bundles';

const mapStateToProps = (state: RootState) => {
    return {
        activeBundle: selectChaosActiveBundle(state),
        activeBundleHosts: selectChaosCellsHostsOfActiveBundle(state),

        idFilter: selectChaosCellsIdFilter(state),
        bundleFilter: selectChaosCellsBundleFilter(state),
        hostFilter: selectChaosCellsHostFilter(state),

        bundles: selectChaosCellsBundles(state),
        hosts: selectChaosCellsHosts(state),
    };
};

const mapDispatchToProps = {
    setTabletsPartial: setChaosPartial,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CellsTableInstruments);
