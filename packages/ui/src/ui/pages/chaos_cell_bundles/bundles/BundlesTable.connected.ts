import type {ComponentProps} from 'react';
import {connect} from 'react-redux';

import BundlesTable from '../../../pages/tablet_cell_bundles/bundles/BundlesTable';
import {
    setChaosActiveBundle,
    setChaosBundlesSortState,
} from '../../../store/actions/chaos_cell_bundles';
import {showChaosCellBundleEditor} from '../../../store/actions/chaos_cell_bundles/tablet-cell-bundle-editor';
import type {RootState} from '../../../store/reducers';
import {selectCluster} from '../../../store/selectors/global';
import {
    selectChaosBundlesSortState,
    selectChaosBundlesSorted,
    selectChaosBundlesTableMode,
    selectChaosBundlesTotal,
    selectChaosIsLoaded,
    selectChaosIsLoading,
} from '../../../store/selectors/chaos_cell_bundles';
import {chaosActiveBundleLink} from '../../../utils/components/tablet-cells';

const columns: ComponentProps<typeof BundlesTable>['columns'] = [
    'bundle',
    'health',
    'tabletCells',
    'changelog_account',
    'actions',
];

const mapStateToProps = (state: RootState) => {
    return {
        loading: selectChaosIsLoading(state),
        loaded: selectChaosIsLoaded(state),
        data: selectChaosBundlesSorted(state),
        total: selectChaosBundlesTotal(state),
        sortState: selectChaosBundlesSortState(state),
        cluster: selectCluster(state),
        allowPerBundleAccounting: false,
        mode: selectChaosBundlesTableMode(state),
        pathPrefix: '//sys/chaos_cell_bundles/',
        columns,
        activeBundleLink: chaosActiveBundleLink,
        writeableByName: {get: () => true},
    };
};

const mapDispatchToProps = {
    setBundlesSortState: setChaosBundlesSortState,
    setActiveBundle: setChaosActiveBundle,
    showCellBundleEditor: showChaosCellBundleEditor,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(BundlesTable);
