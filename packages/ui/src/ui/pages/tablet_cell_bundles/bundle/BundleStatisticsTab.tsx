import React from 'react';
import {useSelector} from '../../../store/redux-hooks';

import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import {selectTabletsActiveBundle} from '../../../store/selectors/tablet_cell_bundles';
import {selectCluster, selectTheme} from '../../../store/selectors/global';
import UIFactory from '../../../UIFactory';
import {NoContent} from '../../../components/NoContent';
import i18n from './i18n';

function BundleStatisticsTab() {
    const cluster = useSelector(selectCluster);
    const bundle = useSelector(selectTabletsActiveBundle);
    const theme = useSelector(selectTheme);

    if (!bundle) {
        return (
            <NoContent
                warning={i18n('alert_no-selected-bundles')}
                hint={i18n('context_choose-bundle')}
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
