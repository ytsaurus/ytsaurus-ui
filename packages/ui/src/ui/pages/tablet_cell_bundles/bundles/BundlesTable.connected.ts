import type {ComponentProps} from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import BundlesTable from '../../../pages/tablet_cell_bundles/bundles/BundlesTable';
import {
    setTabletsActiveBundle,
    setTabletsBundlesSortState,
} from '../../../store/actions/tablet_cell_bundles';
import {showTabletCellBundleEditor} from '../../../store/actions/tablet_cell_bundles/tablet-cell-bundle-editor';
import type {RootState} from '../../../store/reducers';
import type {BundlesTableMode} from '../../../store/reducers/tablet_cell_bundles';
import {
    getCluster,
    getClusterUiConfigEnablePerBundleTabletAccounting,
} from '../../../store/selectors/global';
import {
    getTabletBundlesTableMode,
    getTabletBundlesWriteableByName,
    getTabletsBundlesSortState,
    getTabletsBundlesSorted,
    getTabletsBundlesTotal,
    getTabletsIsLoaded,
    getTabletsIsLoading,
} from '../../../store/selectors/tablet_cell_bundles';
import {tabletActiveBundleLink} from '../../../utils/components/tablet-cells';
import {tabletCellBundleDashboardUrl} from '../../../utils/tablet_cell_bundles';

const calcColumns = createSelector([getTabletBundlesTableMode], (mode: BundlesTableMode) => {
    const columns: ComponentProps<typeof BundlesTable>['columns'] = ['bundle'];

    switch (mode) {
        case 'tablets': {
            columns.push(
                'tablet_count_percentage',
                'tablet_count',
                'tablet_count_limit',
                'tablet_count_free',
            );
            break;
        }
        case 'tablets_memory': {
            columns.push(
                'tablet_static_memory_percentage',
                'tablet_static_memory',
                'tablet_static_memory_limit',
                'tablet_static_memory_free',
            );
            break;
        }
        default: {
            columns.push(
                'health',
                'nodes',
                'tabletCells',
                'tablets',
                'memory',
                'uncompressed',
                'compressed',
                'enable_bundle_controller',
                'enable_bundle_balancer',
                'changelog_account',
            );
        }
    }

    columns.push('actions');

    return columns;
});

const mapStateToProps = (state: RootState) => {
    return {
        loading: getTabletsIsLoading(state),
        loaded: getTabletsIsLoaded(state),
        data: getTabletsBundlesSorted(state),
        total: getTabletsBundlesTotal(state),
        sortState: getTabletsBundlesSortState(state),
        cluster: getCluster(state),
        allowPerBundleAccounting: getClusterUiConfigEnablePerBundleTabletAccounting(state),
        pathPrefix: '//sys/tablet_cell_bundles/',
        columns: calcColumns(state),
        activeBundleLink: tabletActiveBundleLink,
        bundleDashboardUrl: tabletCellBundleDashboardUrl,
        writeableByName: getTabletBundlesWriteableByName(state),
    };
};

const mapDispatchToProps = {
    setBundlesSortState: setTabletsBundlesSortState,
    setActiveBundle: setTabletsActiveBundle,
    showCellBundleEditor: showTabletCellBundleEditor,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(BundlesTable);
