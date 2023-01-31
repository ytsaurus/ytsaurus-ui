import React from 'react';
import {useSelector} from 'react-redux';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import {getTabletsActiveBundle} from '../../../store/selectors/tablet_cell_bundles';
import {getCluster, getTheme} from '../../../store/selectors/global';
import UIFactory from '../../../UIFactory';
import {NoContent} from '../../../components/NoContent/NoContent';

function BundleStatisticsTab() {
    const cluster = useSelector(getCluster);
    const bundle = useSelector(getTabletsActiveBundle);
    const theme = useSelector(getTheme);

    if (!bundle) {
        return (
            <NoContent
                warning="You don't have any selected bundles"
                hint="Please choose one to display charts"
            />
        );
    }

    const StatisticsComponent = UIFactory.getStatisticsComponentForBundle()!;

    return (
        <ErrorBoundary>
            <StatisticsComponent {...{cluster, bundle, theme}} />
        </ErrorBoundary>
    );
}

export default React.memo(BundleStatisticsTab);
