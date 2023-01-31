import {connect} from 'react-redux';

import BundlesTableInstruments from '../../../pages/tablet_cell_bundles/bundles/BundlesTableInstruments';
import {
    setChaosBundlesAccountFilter,
    setChaosBundlesNameFilter,
    setChaosBundlesTagNodeFilter,
    setChaosFirstBundleAsActive,
    setChaosPartial,
} from '../../../store/actions/chaos_cell_bundles';
import type {RootState} from '../../../store/reducers';
import type {BundlesTableMode} from '../../../store/reducers/chaos_cell_bundles';
import {
    getChaosBundlesAccountFilter,
    getChaosBundlesNameFilter,
    getChaosBundlesTableMode,
    getChaosBundlesTagNodeFilter,
} from '../../../store/selectors/chaos_cell_bundles';

const modes: Array<BundlesTableMode> = ['default'];

const mapStateToProps = (state: RootState) => {
    return {
        accountFilter: getChaosBundlesAccountFilter(state),
        bundlesTableMode: getChaosBundlesTableMode(state),
        nameFilter: getChaosBundlesNameFilter(state),
        tagNodeFilter: getChaosBundlesTagNodeFilter(state),
        modes,
    };
};

const mapDispatchToProps = {
    setTabletsBundlesNameFilter: setChaosBundlesNameFilter,
    setTabletsBundlesAccountFilter: setChaosBundlesAccountFilter,
    setTabletsBundlesTagNodeFilter: setChaosBundlesTagNodeFilter,
    setTabletsFirstBundleAsActive: setChaosFirstBundleAsActive,
    setTabletsPartial: setChaosPartial,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(BundlesTableInstruments);
