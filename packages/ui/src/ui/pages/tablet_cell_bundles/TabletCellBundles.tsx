import React from 'react';
import cn from 'bem-cn-lite';

import i18n from './i18n';

import reduce_ from 'lodash/reduce';

import Tabs from '../../components/Tabs/Tabs';
import {TabletsTab} from '../../constants/tablets';
import {Redirect, Route, Switch, useRouteMatch} from 'react-router';
import {BundleCells} from './cells/Cells';
import {type TabSettings, makeTabProps} from '../../utils';
import {insertTab} from '../../utils/tabs';
import {useUpdater} from '../../hooks/use-updater';
import {useDispatch, useSelector} from '../../store/redux-hooks';
import {fetchTabletsBundles} from '../../store/actions/tablet_cell_bundles';
import {
    selectTabletBundlesWriteableByName,
    selectTabletsActiveBundle,
    selectTabletsActiveBundleData,
    selectTabletsError,
} from '../../store/selectors/tablet_cell_bundles/index';
import {YTErrorBlock} from '../../containers/Block/Block';
import Bundles from './bundles/Bundles';

import './TabletCellBundles.scss';
import BundleStatisticsTab from './bundle/BundleStatisticsTab';
import BundleMonitorTab from './bundle/BundleMonitorTab';
import BundleAclTab from './bundle/BundleAclTab';
import BundleMetaTable from './bundle/BundleMetaTable';
import {BundleInstancesTab} from './bundle/BundleInstancesTab';
import {BundleProxiesTab} from './bundle/BundleProxiesTab';
import Icon from '../../components/Icon/Icon';
import Label from '../../components/Label';
import {tabletCellBundleDashboardUrl} from '../../utils/tablet_cell_bundles';
import {BundleEditorDialog as TabletBundleEditorDialog} from '../../pages/tablet_cell_bundles/bundles/BundleEditorDialog/BundleEditorDialog';
import {showTabletCellBundleEditor} from '../../store/actions/tablet_cell_bundles/tablet-cell-bundle-editor';
import Button from '../../components/Button/Button';
import {
    selectCluster,
    selectClusterUiConfigEnablePerBundleTabletAccounting,
} from '../../store/selectors/global';
import ChartLink from '../../components/ChartLink/ChartLink';
import {Page} from '../../constants/index';
import UIFactory, {type BundleExtraTab} from '../../UIFactory';
import {formatByParams} from '../../../shared/utils/format';
import {UI_TAB_SIZE} from '../../constants/global';
import {TabletErrorsLazy} from '../../pages/tablet-errors-by-bundle/lazy';
import {getConfigData} from '../../config/ui-settings';
import {AllBundlesTabs} from './AllBundlesTabs/AllBundlesTabs';

const b = cn('tablets');

const TabletsTabs = React.memo(TabletsTabsImpl);

function getShowSettings(activeBundle: string | undefined) {
    return reduce_(
        TabletsTab,
        (acc, v) => {
            if (v === TabletsTab.CHAOS_CELLS) {
                acc[v] = {show: false};
            } else {
                acc[v] = {show: v === TabletsTab.TABLET_CELLS || Boolean(activeBundle)};
            }
            return acc;
        },
        {} as Record<string, TabSettings>,
    );
}

export default function TabletCellBundles() {
    const match = useRouteMatch();
    const cluster = useSelector(selectCluster);

    const error = useSelector(selectTabletsError);
    const activeBundle = useSelector(selectTabletsActiveBundle);
    const activeBundleData = useSelector(selectTabletsActiveBundleData);
    const enableBundleController = activeBundleData?.enable_bundle_controller ?? false;
    const isDrillsModeEnabled =
        activeBundleData?.bundle_controller_target_config?.enable_drills_mode === true;
    const dispatch = useDispatch();
    const fetchFn = React.useCallback(() => {
        dispatch(fetchTabletsBundles());
    }, [dispatch]);
    useUpdater(fetchFn);

    const writeableByName = useSelector(selectTabletBundlesWriteableByName);

    const bundleWritable = writeableByName.get(activeBundle);

    const allowEdit = enableBundleController || bundleWritable;

    const showSettings = getShowSettings(activeBundle);

    const statsTab = showSettings[TabletsTab.STATISTICS];
    statsTab.show = statsTab.show && Boolean(UIFactory.getStatisticsComponentForBundle());

    const bundleExtraTabs = UIFactory.getBundleExtraTabs();
    bundleExtraTabs.forEach(({value}) => {
        showSettings[value] = {show: Boolean(activeBundle)};
    });

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
                            isDrillsModeEnabled={isDrillsModeEnabled}
                        />
                        <div className={b('tabs')}>
                            <TabletsTabs
                                activeBundle={activeBundle}
                                showSettings={showSettings}
                                monitoringTitle={monitoringTitle}
                                bundleExtraTabs={bundleExtraTabs}
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
                        {activeBundle &&
                            bundleExtraTabs.map(({value, component: Component}) => (
                                <Route
                                    key={value}
                                    path={`/${cluster}/${Page.TABLET_CELL_BUNDLES}/${value}`}
                                    render={() => (
                                        <Component cluster={cluster} bundle={activeBundle} />
                                    )}
                                />
                            ))}
                        <Route
                            path={`/${cluster}/${Page.TABLET_CELL_BUNDLES}/${TabletsTab.ACL}`}
                            render={() => <BundleAclTab className={b('acl-tab')} />}
                        />
                        <Route
                            path={`/${cluster}/${Page.TABLET_CELL_BUNDLES}`}
                            component={Bundles}
                        />
                        <Redirect
                            from={`/${cluster}/${Page.TABLET_CELL_BUNDLES}/*`}
                            to={match.path}
                        />
                    </Switch>
                </div>
            </section>
            <TabletBundleEditorDialog />
        </div>
    );
}

function ActiveBundleDetails({
    activeBundle,
    allowEdit,
    cluster,
    isDrillsModeEnabled,
}: {
    activeBundle?: string;
    allowEdit?: boolean;
    cluster: string;
    isDrillsModeEnabled: boolean;
}) {
    const dispatch = useDispatch();
    const allowAccounting = useSelector(selectClusterUiConfigEnablePerBundleTabletAccounting);

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
                            {isDrillsModeEnabled && (
                                <Label
                                    className={b('drills-mode-label')}
                                    theme="warning"
                                    text={i18n('alert_drills-mode-enabled')}
                                />
                            )}
                        </div>
                        {allowAccounting && allowEdit && (
                            <div className={b('tabs-edit-btn')}>
                                <Button className={b('edit-btn')} size={'m'} onClick={showEditor}>
                                    <Icon awesome={'pencil'} size={13} />
                                    {i18n('action_edit-bundle')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <BundleMetaTable cluster={cluster} bundle={activeBundle} />
        </React.Fragment>
    );
}

function TabletsTabsImpl({
    activeBundle,
    showSettings,
    monitoringTitle = i18n('title_monitoring'),
    bundleExtraTabs,
}: {
    activeBundle: string | undefined;
    showSettings: Record<string, TabSettings>;
    monitoringTitle?: string;
    bundleExtraTabs: Array<BundleExtraTab>;
}) {
    const match = useRouteMatch<{cluster: string}>();

    const tabs: Array<{value: string}> = Object.values(TabletsTab).map((value) => ({value}));
    const extraTabTitles: Record<string, string> = {};

    bundleExtraTabs.forEach((extraTab) => {
        insertTab(tabs, extraTab);
        extraTabTitles[extraTab.value] = extraTab.title;
    });

    const localTabs = Object.fromEntries(tabs.map(({value}) => [value, value]));

    if (!activeBundle) {
        return <AllBundlesTabs className={b('tabs')} />;
    }

    const tabProps = makeTabProps(match.url, localTabs, showSettings, undefined, {
        [TabletsTab.MONITOR]: monitoringTitle,
        ...extraTabTitles,
    });

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
