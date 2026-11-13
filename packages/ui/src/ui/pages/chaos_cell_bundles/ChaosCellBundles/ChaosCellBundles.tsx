import React from 'react';
import cn from 'bem-cn-lite';
import {Route, Switch, useRouteMatch} from 'react-router';

import UIFactory from '../../../UIFactory';
import {TabletsTab} from '../../../constants/tablets';
import {YTErrorBlock} from '../../../containers/Block/Block';
import {useUpdater} from '../../../hooks/use-updater';
import {fetchChaosBundles} from '../../../store/actions/chaos_cell_bundles';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectChaosActiveBundle,
    selectChaosError,
} from '../../../store/selectors/chaos_cell_bundles';
import Bundles from '../bundles/Bundles';
import ChaosBundleEditorDialog from '../bundles/ChaosBundleEditorDialog/ChaosBundleEditorDialog.connected';
import {ChaosCells} from '../cells/Cells';
import {ChaosBundleMonitorTab} from '../ChaosBundleMonitorTab/ChaosBundleMonitorTab';

import {ChaosBundlesTabs} from './ChaosBundlesTabs';

import './ChaosCellBundles.scss';

const block = cn('chaos-cell-bundles');

export function ChaosCellBundles() {
    const match = useRouteMatch();
    const activeBundle = useSelector(selectChaosActiveBundle);
    const error = useSelector(selectChaosError);
    const dispatch = useDispatch();
    const fetchBundles = React.useCallback(() => {
        dispatch(fetchChaosBundles());
    }, [dispatch]);
    useUpdater(fetchBundles);

    const monitoringComponent = UIFactory.getMonitoringForChaosBundle();

    return (
        <div className="elements-page__content">
            <section className="elements-main-section">
                <div className={block('heading')}>
                    {activeBundle && (
                        <div className="elements-heading elements-heading_size_l">
                            {activeBundle}
                        </div>
                    )}
                    <ChaosBundlesTabs
                        className={block('tabs')}
                        activeBundle={activeBundle}
                        hasMonitoring={Boolean(monitoringComponent)}
                    />
                </div>
                {error && <YTErrorBlock error={error} />}
                <Switch>
                    <Route
                        path={`${match.path}/${TabletsTab.CHAOS_CELLS}`}
                        component={ChaosCells}
                    />
                    {activeBundle && monitoringComponent && (
                        <Route
                            path={`${match.path}/${TabletsTab.MONITOR}`}
                            render={() => <ChaosBundleMonitorTab component={monitoringComponent} />}
                        />
                    )}
                    <Route path={match.path} component={Bundles} />
                </Switch>
            </section>
            <ChaosBundleEditorDialog />
        </div>
    );
}
