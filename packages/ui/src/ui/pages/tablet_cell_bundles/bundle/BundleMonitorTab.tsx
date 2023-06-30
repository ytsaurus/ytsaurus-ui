import React from 'react';
import {useSelector} from 'react-redux';
import {getCluster} from '../../../store/selectors/global';
import ypath from '../../../common/thor/ypath';
import {getTabletsActiveBundleData} from '../../../store/selectors/tablet_cell_bundles';

import {NoContent} from '../../../components/NoContent/NoContent';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';

import './BundleMonitorTab.scss';

function BundleMonitorTab(props: {
    component: React.ComponentType<{cluster: string; tablet_cell_bundle: string; bundleData: any}>;
}) {
    const {component: BundleMonitor} = props;
    const bundleData = useSelector(getTabletsActiveBundleData);
    const cluster = useSelector(getCluster);

    const tablet_cell_bundle: undefined | string = React.useMemo(() => {
        return ypath.getValue(bundleData, '/bundle');
    }, [bundleData]);

    if (!tablet_cell_bundle) {
        return (
            <NoContent
                warning="You don't have any selected bundles"
                hint="Please choose one to display charts"
            />
        );
    }

    return (
        <ErrorBoundary>
            <BundleMonitor {...{cluster, tablet_cell_bundle, bundleData}} />
        </ErrorBoundary>
    );
}

export default React.memo(BundleMonitorTab);
