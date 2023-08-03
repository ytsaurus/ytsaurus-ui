import type {ComponentProps} from 'react';
import {connect} from 'react-redux';

import BundlesTable from '../../../pages/tablet_cell_bundles/bundles/BundlesTable';
import {
    setChaosActiveBundle,
    setChaosBundlesSortState,
} from '../../../store/actions/chaos_cell_bundles';
import {showChaosCellBundleEditor} from '../../../store/actions/chaos_cell_bundles/tablet-cell-bundle-editor';
import type {RootState} from '../../../store/reducers';
import {getCluster} from '../../../store/selectors/global';
import {
    getChaosBundlesSortState,
    getChaosBundlesSorted,
    getChaosBundlesTableMode,
    getChaosBundlesTotal,
    getChaosIsLoaded,
    getChaosIsLoading,
} from '../../../store/selectors/chaos_cell_bundles';
import {chaosActiveBundleLink} from '../../../utils/components/tablet-cells';

const columns: ComponentProps<typeof BundlesTable>['columns'] = [
    'bundle',
    'health',
    'nodes',
    'tabletCells',
    'enable_bundle_balancer',
    'changelog_account',
    'actions',
];

const mapStateToProps = (state: RootState) => {
    return {
        loading: getChaosIsLoading(state),
        loaded: getChaosIsLoaded(state),
        data: getChaosBundlesSorted(state),
        total: getChaosBundlesTotal(state),
        sortState: getChaosBundlesSortState(state),
        cluster: getCluster(state),
        allowPerBundleAccounting: false,
        mode: getChaosBundlesTableMode(state),
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
