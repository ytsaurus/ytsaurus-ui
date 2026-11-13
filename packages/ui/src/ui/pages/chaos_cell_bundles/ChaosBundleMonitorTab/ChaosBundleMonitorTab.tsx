import React from 'react';

import {type ChaosBundleMonitoringProps} from '../../../UIFactory';
import {useSelector} from '../../../store/redux-hooks';
import {selectCluster} from '../../../store/selectors/global';
import {selectChaosActiveBundle} from '../../../store/selectors/chaos_cell_bundles';
import {NoContent} from '../../../components/NoContent';
import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import i18n from '../../tablet_cell_bundles/bundle/i18n';

interface Props {
    component: React.ComponentType<ChaosBundleMonitoringProps>;
}

export function ChaosBundleMonitorTab({component: Monitor}: Props) {
    const cluster = useSelector(selectCluster);
    const bundle = useSelector(selectChaosActiveBundle);

    if (!bundle) {
        return (
            <NoContent
                warning={i18n('alert_no-selected-bundles')}
                hint={i18n('context_choose-bundle')}
            />
        );
    }
    return (
        <ErrorBoundary>
            <Monitor cluster={cluster} chaos_cell_bundle={bundle} />
        </ErrorBoundary>
    );
}
