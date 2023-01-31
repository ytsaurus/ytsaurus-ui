import {connect} from 'react-redux';

import BundlesTableInstruments from '../../../pages/tablet_cell_bundles/bundles/BundlesTableInstruments';
import {
    setTabletsBundlesAccountFilter,
    setTabletsBundlesNameFilter,
    setTabletsBundlesTagNodeFilter,
    setTabletsFirstBundleAsActive,
    setTabletsPartial,
} from '../../../store/actions/tablet_cell_bundles';
import type {RootState} from '../../../store/reducers';
import type {BundlesTableMode} from '../../../store/reducers/tablet_cell_bundles';
import {
    getTabletBundlesTableMode,
    getTabletsBundlesAccountFilter,
    getTabletsBundlesNameFilter,
    getTabletsBundlesTagNodeFilter,
} from '../../../store/selectors/tablet_cell_bundles';

const modes: Array<BundlesTableMode> = ['default', 'tablets', 'tablets_memory'];

const mapStateToProps = (state: RootState) => {
    return {
        accountFilter: getTabletsBundlesAccountFilter(state),
        bundlesTableMode: getTabletBundlesTableMode(state),
        nameFilter: getTabletsBundlesNameFilter(state),
        tagNodeFilter: getTabletsBundlesTagNodeFilter(state),
        modes,
    };
};

const mapDispatchToProps = {
    setTabletsBundlesNameFilter,
    setTabletsBundlesAccountFilter,
    setTabletsBundlesTagNodeFilter,
    setTabletsFirstBundleAsActive,
    setTabletsPartial: setTabletsPartial,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(BundlesTableInstruments);
