import React from 'react';
import cn from 'bem-cn-lite';

import reduce_ from 'lodash/reduce';

import Tabs from '../../components/Tabs/Tabs';
import {TabletsTab} from '../../constants/tablets';
import {Redirect, Route, Switch, useRouteMatch} from 'react-router';
import {BundleCells} from './cells/Cells';
import {TabSettings, makeTabProps} from '../../utils';
import {useUpdater} from '../../hooks/use-updater';
import {useDispatch, useSelector} from '../../store/redux-hooks';
import {fetchChaosBundles as fetchChaosBundles} from '../../store/actions/chaos_cell_bundles';
import {fetchTabletsBundles} from '../../store/actions/tablet_cell_bundles';
import {
    getTabletBundlesWriteableByName,
    getTabletsActiveBundle,
    getTabletsActiveBundleData,
    getTabletsError,
} from '../../store/selectors/tablet_cell_bundles/index';
import {YTErrorBlock} from '../../components/Error/Error';
import Bundles from './bundles/Bundles';

import './TabletCellBundles.scss';
import BundleStatisticsTab from './bundle/BundleStatisticsTab';
import BundleMonitorTab from './bundle/BundleMonitorTab';
import BundleAclTab from './bundle/BundleAclTab';
import BundleMetaTable from './bundle/BundleMetaTable';
import {BundleInstancesTab} from './bundle/BundleInstancesTab';
import {BundleProxiesTab} from './bundle/BundleProxiesTab';
import Icon from '../../components/Icon/Icon';
import {tabletCellBundleDashboardUrl} from '../../utils/tablet_cell_bundles';
import {BundleEditorDialog as TabletBundleEditorDialog} from '../../pages/tablet_cell_bundles/bundles/BundleEditorDialog/BundleEditorDialog';
import {showTabletCellBundleEditor} from '../../store/actions/tablet_cell_bundles/tablet-cell-bundle-editor';
import Button from '../../components/Button/Button';
import {
    getCluster,
    getClusterUiConfigEnablePerBundleTabletAccounting,
} from '../../store/selectors/global';
import ChartLink from '../../components/ChartLink/ChartLink';
import {Page} from '../../constants/index';
import ChaosCellBundles from '../../pages/chaos_cell_bundles/bundles/Bundles';
import ChaosBundleEditorDialog from '../../pages/chaos_cell_bundles/bundles/ChaosBundleEditorDialog/ChaosBundleEditorDialog.connected';
import {ChaosCells} from '../../pages/chaos_cell_bundles/cells/Cells';
import UIFactory from '../../UIFactory';
import {TabletBundle} from '../../store/reducers/tablet_cell_bundles';
import {formatByParams} from '../../../shared/utils/format';
import {UI_TAB_SIZE} from '../../constants/global';
import {TabletErrorsLazy} from '../../pages/tablet-errors-by-bundle/lazy';
import {getConfigData} from '../../config/ui-settings';

const b = cn('tablets');

const TabletsTabs = React.memo(TabletsTabsImpl);

function useShowSettings(activeBundle: string | undefined, enableBundleController: boolean) {
    return React.useMemo(() => {
        return reduce_(
            TabletsTab,
            (acc, v) => {
                if (v === TabletsTab.CHAOS_CELLS) {
                    // TODO: fix me when a page of active chaos-cell-bundle is ready
                    acc[v] = {show: false};
                } else {
                    acc[v] = {show: v === TabletsTab.TABLET_CELLS || Boolean(activeBundle)};
                }
                return acc;
            },
            {} as Record<(typeof TabletsTab)[keyof typeof TabletsTab], TabSettings>,
        );
    }, [activeBundle, enableBundleController]);
}

export default function TabletCellBundles() {
    const match = useRouteMatch();
    const cluster = useSelector(getCluster);

    const error = useSelector(getTabletsError);
    const activeBundle = useSelector(getTabletsActiveBundle);
    const {enable_bundle_controller: enableBundleController = false} =
        useSelector(getTabletsActiveBundleData) || ({} as Partial<TabletBundle>);
    const dispatch = useDispatch();
    const fetchFn = React.useCallback(() => {
        Promise.all([dispatch(fetchChaosBundles()), dispatch(fetchTabletsBundles())]);
    }, [dispatch]);
    useUpdater(fetchFn);

    const writeableByName = useSelector(getTabletBundlesWriteableByName);

    const bundleWritable = writeableByName.get(activeBundle);

    const allowEdit = enableBundleController || bundleWritable;

    const showSettings = useShowSettings(activeBundle, enableBundleController);

    const statsTab = showSettings[TabletsTab.STATISTICS];
    statsTab.show = statsTab.show && Boolean(UIFactory.getStatisticsComponentForBundle());

    const monTab = showSettings[TabletsTab.MONITOR];

    const {
        component: monitoringComponent,
        urlTemplate,
        title: monitoringTitle,
    } = UIFactory.getMonitoringForBundle() ?? {};
    monTab.show = monTab.show && Boolean(monitoringComponent || urlTemplate);

    if (urlTemplate) {
        monTab.external = true;
        monTab.routed = false;
        monTab.url = formatByParams(urlTemplate, {
            ytCluster: cluster,
            ytTabletCellBundle: activeBundle,
        });
    }

    const instTab = showSettings[TabletsTab.INSTANCES];
    instTab.show = instTab.show && enableBundleController;

    const proxyTab = showSettings[TabletsTab.PROXIES];
    proxyTab.show = proxyTab.show && enableBundleController;

    const errorsTab = showSettings[TabletsTab.TABLET_ERRORS];
    errorsTab.show = errorsTab.show && getConfigData().allowTabletErrorsAPI;

    return (
        <div className="elements-page__content">
            <section className={b(null, 'elements-main-section')}>
                <div className={b('content')}>
                    <div className={b('heading')}>
                        <ActiveBundleDetails
                            allowEdit={allowEdit}
                            activeBundle={activeBundle}
                            cluster={cluster}
                        />
                        <div className={b('tabs')}>
                            <TabletsTabs
                                activeBundle={activeBundle}
                                showSettings={showSettings}
                                monitoringTitle={monitoringTitle}
                            />
                        </div>
                    </div>
                </div>
                {error && <YTErrorBlock error={error} />}
                <div className={b('tab-viewer')}>
                    <Switch>
                        {instTab && (
                            <Route
                                path={`${match.path}/${TabletsTab.INSTANCES}`}
                                component={BundleInstancesTab}
                            />
                        )}
                        {proxyTab && (
                            <Route
                                path={`${match.path}/${TabletsTab.PROXIES}`}
                                component={BundleProxiesTab}
                            />
                        )}
                        {errorsTab.show && (
                            <Route
                                path={`/${cluster}/${Page.TABLET_CELL_BUNDLES}/${TabletsTab.TABLET_ERRORS}`}
                                render={() => <TabletErrorsLazy bundle={activeBundle} />}
                            />
                        )}
                        <Route
                            path={`/${cluster}/${Page.TABLET_CELL_BUNDLES}/${TabletsTab.TABLET_CELLS}`}
                            component={BundleCells}
                        />
                        <Route
                            path={`/${cluster}/${Page.CHAOS_CELL_BUNDLES}/${TabletsTab.CHAOS_CELLS}`}
                            component={ChaosCells}
                        />
                        {statsTab.show && (
                            <Route
                                path={`/${cluster}/${Page.TABLET_CELL_BUNDLES}/${TabletsTab.STATISTICS}`}
                                component={BundleStatisticsTab}
                            />
                        )}
                        {monTab.show && monitoringComponent && (
                            <Route
                                path={`/${cluster}/${Page.TABLET_CELL_BUNDLES}/${TabletsTab.MONITOR}`}
                                render={() => <BundleMonitorTab component={monitoringComponent} />}
                            />
                        )}
                        <Route
                            path={`/${cluster}/${Page.TABLET_CELL_BUNDLES}/${TabletsTab.ACL}`}
                            render={() => <BundleAclTab className={b('acl-tab')} />}
                        />
                        <Route
                            path={`/${cluster}/${Page.TABLET_CELL_BUNDLES}`}
                            component={Bundles}
                        />
                        <Route
                            path={`/${cluster}/${Page.CHAOS_CELL_BUNDLES}`}
                            component={ChaosCellBundles}
                        />
                        <Redirect
                            from={`/${cluster}/${Page.TABLET_CELL_BUNDLES}/*`}
                            to={match.path}
                        />
                    </Switch>
                </div>
            </section>
            <TabletBundleEditorDialog />
            <ChaosBundleEditorDialog />
        </div>
    );
}

function ActiveBundleDetails({
    activeBundle,
    allowEdit,
    cluster,
}: {
    activeBundle?: string;
    allowEdit?: boolean;
    cluster: string;
}) {
    const dispatch = useDispatch();
    const allowAccounting = useSelector(getClusterUiConfigEnablePerBundleTabletAccounting);

    const showEditor = React.useCallback(() => {
        if (activeBundle) {
            dispatch(showTabletCellBundleEditor(activeBundle));
        }
    }, [activeBundle, dispatch]);

    return (
        <React.Fragment>
            {activeBundle && (
                <div className="elements-heading elements-heading_size_l">
                    <div className={b('bundle-name')}>
                        <div className={b('bundle-name-left')}>
                            {activeBundle}
                            <ChartLink
                                className={b('dashboard-link')}
                                theme={'ghost'}
                                url={tabletCellBundleDashboardUrl(cluster, activeBundle)}
                            />
                        </div>
                        {allowAccounting && allowEdit && (
                            <div className={b('tabs-edit-btn')}>
                                <Button className={b('edit-btn')} size={'m'} onClick={showEditor}>
                                    <Icon awesome={'pencil'} />
                                    Edit Bundle
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <BundleMetaTable />
        </React.Fragment>
    );
}

function makeAllTabsProps(matchUrl: string, cluster: string) {
    const res = makeTabProps(matchUrl, {});
    res.items = [
        {
            value: Page.TABLET_CELL_BUNDLES,
            text: 'Tablet cell bundles',
            show: true,
            url: `/${cluster}/${Page.TABLET_CELL_BUNDLES}`,
        },
        {
            value: TabletsTab.TABLET_CELLS,
            text: 'Tablet cells',
            show: true,
            url: `/${cluster}/${Page.TABLET_CELL_BUNDLES}/${TabletsTab.TABLET_CELLS}`,
        },
        {
            value: Page.CHAOS_CELL_BUNDLES,
            text: 'Chaos cell bundles',
            show: true,
            url: `/${cluster}/${Page.CHAOS_CELL_BUNDLES}`,
        },
        {
            value: TabletsTab.CHAOS_CELLS,
            text: 'Chaos cells',
            show: true,
            url: `/${cluster}/${Page.CHAOS_CELL_BUNDLES}/${TabletsTab.CHAOS_CELLS}`,
        },
    ];
    return res;
}

function TabletsTabsImpl({
    activeBundle,
    showSettings,
    monitoringTitle = 'Monitoring',
}: {
    activeBundle: string | undefined;
    showSettings: Record<string, TabSettings>;
    monitoringTitle?: string;
}) {
    const match = useRouteMatch<{cluster: string}>();
    const {cluster} = match.params;

    const tabProps = activeBundle
        ? makeTabProps(match.url, TabletsTab, showSettings, undefined, {
              [TabletsTab.MONITOR]: monitoringTitle,
          })
        : makeAllTabsProps(match.url, cluster);

    return (
        <Tabs
            {...tabProps}
            className={b('tabs')}
            routed
            routedPreserveLocation
            exactNavLink
            size={UI_TAB_SIZE}
        />
    );
}
