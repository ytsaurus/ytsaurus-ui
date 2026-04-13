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
    selectTabletBundlesTableMode,
    selectTabletsBundlesAccountFilter,
    selectTabletsBundlesNameFilter,
    selectTabletsBundlesTagNodeFilter,
} from '../../../store/selectors/tablet_cell_bundles';

const modes: Array<BundlesTableMode> = ['default', 'tablets', 'tablets_memory'];

const mapStateToProps = (state: RootState) => {
    return {
        accountFilter: selectTabletsBundlesAccountFilter(state),
        bundlesTableMode: selectTabletBundlesTableMode(state),
        nameFilter: selectTabletsBundlesNameFilter(state),
        tagNodeFilter: selectTabletsBundlesTagNodeFilter(state),
        modes,
    };
};

const mapDispatchToProps = {
    setTabletsBundlesNameFilter,
    setTabletsBundlesAccountFilter,
    setTabletsBundlesTagNodeFilter,
    setTabletsFirstBundleAsActive,
    setTabletsPartial,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(BundlesTableInstruments);
