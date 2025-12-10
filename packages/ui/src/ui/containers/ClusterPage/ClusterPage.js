import React, {Component, Fragment} from 'react';
import {Redirect, Route, Switch, useLocation} from 'react-router';
import {connect} from 'react-redux';
import {useSelector} from '../../store/redux-hooks';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import {ClusterMaintenanceContext} from '../../hooks/use-maintenance';

import {BanPageLazy} from '../BanPage/lazy';
import {ComponentsLazy} from '../../pages/components/lazy';
import {OperationsLazy} from '../../pages/operations/lazy';
import {AccountsLazy} from '../../pages/accounts/lazy';
import {DashboardLazy} from '../../pages/dashboard/lazy';
import {SystemLazy} from '../../pages/system/lazy';
import {NavigationLazy} from '../../pages/navigation/lazy';
import {PathViewerLazy} from '../../pages/path-viewer/lazy';
import {TabletLazy} from '../../pages/tablet/lazy';
import {TabletCellBundlesLazy} from '../../pages/tablet_cell_bundles/lazy';
import {GroupsPageLazy} from '../../pages/groups/lazy';
import {UsersPageLazy} from '../../pages/users/lazy';
import {SchedulingLazy} from '../../pages/scheduling/lazy';
import {QueryTrackerLazy} from '../../pages/query-tracker/lazy';
import {JobLazy} from '../../pages/job/lazy';
import {ChytPageLazy} from '../../pages/chyt/lazy';
import {Dashboard2Lazy} from '../../pages/dashboard2/lazy';
import {FlowPageLazy} from '../../pages/flow/lazy';

import ClusterPageHeader from '../ClusterPageHeader/ClusterPageHeader';
import PageTracker from './PageTracker';

import {PageHeadByCluster} from '../../components/PageHead/PageHead';

import FlexSplitPane from '../../components/FlexSplitPane/FlexSplitPane';
import {YTErrorBlock} from '../../components/Error/Error';
import {ElementWidthAsCssVariable} from '../../components/ElementWidthAsCssVariable/ElementWidthAsCssVariable';
import {HandleMaintenance} from '../../containers/MaintenancePage/HandleMaintenance';
import PreloadError from '../../containers/PreloadError/PreloadError';

import {ScrollableElementContext} from '../../hooks/use-scrollable-element';

import {LOADING_STATUS, Page, SPLIT_PANE_ID} from '../../constants/index';
import {joinMenuItemsAction, splitMenuItemsAction, trackVisit} from '../../store/actions/menu';
import {setSetting} from '../../store/actions/settings';
import {unmountCluster, updateCluster} from '../../store/actions/cluster-params';
import {updateTitle} from '../../store/actions/global';
import {getClusterUiConfig} from '../../store/selectors/global';
import {isExperimentalPagesReady} from '../../store/selectors/global/experimental-pages';
import {getClusterConfig} from '../../utils';
import {NAMESPACES, SettingName} from '../../../shared/constants/settings';
import {getClusterPagePaneSizes, getStartingPage} from '../../store/selectors/settings';
import {getSettingNewDashboardPage} from '../../store/selectors/dashboard2/dashboard';
import SupportedFeaturesUpdater from './SupportedFeaturesUpdater';
import {useRumMeasureStart, useRumMeasureStop} from '../../rum/RumUiContext';
import {RumMeasureTypes} from '../../rum/rum-measure-types';
import {useClusterFromLocation} from '../../hooks/use-cluster';
import {makeExtraPageRoutes} from './ExtraClusterPageRoutes';
import {odinPageInfo} from '../../pages/odin/lazy';
import {hasOdinPage} from '../../config';

import './ClusterPage.scss';

const b = cn('cluster-page');

const RedirectToBanIfNeededMemo = React.memo(RedirectToBanIfNeeded);

class ClusterPage extends Component {
    static propTypes = {
        cluster: PropTypes.string,

        // from connect
        clusters: PropTypes.object.isRequired,
        clusterPagePaneSizes: PropTypes.array,
        login: PropTypes.string,
        queriesPageAllowed: PropTypes.bool,
        startingPage: PropTypes.string.isRequired,
        isLoaded: PropTypes.bool.isRequired,
        hasError: PropTypes.bool.isRequired,
        error: PropTypes.shape({
            errorType: PropTypes.string,
        }).isRequired,
        paramsError: PropTypes.any,
        splitScreen: PropTypes.shape({
            isSplit: PropTypes.bool.isRequired,
            paneClassNames: PropTypes.array.isRequired,
        }).isRequired,

        splitMenuItemsAction: PropTypes.func.isRequired,
        setSetting: PropTypes.func.isRequired,
        joinMenuItemsAction: PropTypes.func.isRequired,
        updateCluster: PropTypes.func.isRequired,
        updateTitle: PropTypes.func.isRequired,
        unmountCluster: PropTypes.func.isRequired,
        trackVisit: PropTypes.func.isRequired,

        allowChyt: PropTypes.bool,
        allowStartPageRedirect: PropTypes.bool,
    };

    state = {
        width: 'large',
    };

    componentDidMount() {
        const {cluster} = this.props;
        this.props.updateCluster(cluster);
    }

    getSnapshotBeforeUpdate(prevProps) {
        if (prevProps.splitScreen.isSplit !== this.props.splitScreen.isSplit) {
            return this.props.splitScreen.isSplit
                ? window.pageYOffset
                : this.contentPaneRef.current.scrollTop;
        }

        return null;
    }

    componentDidUpdate(prevProps, prevState, prevScroll) {
        if (prevScroll !== null) {
            if (this.props.splitScreen.isSplit) {
                this.contentPaneRef.current.scrollTop = prevScroll;
            }

            window.scrollBy(0, prevScroll);
        }

        const {cluster: prevCluster} = prevProps;
        const {cluster} = this.props;

        if (cluster !== prevCluster) {
            this.props.updateCluster(cluster);
        }
    }

    componentWillUnmount() {
        this.props.updateTitle({path: '', page: ''});
        this.props.unmountCluster();
    }

    contentPaneRef = React.createRef();

    onResize = () => {
        const {splitScreen} = this.props;
        const toolbar = document.querySelector('#elements-toolbar');

        if (splitScreen.isSplit && toolbar) {
            const gutterWidth = 10;
            const offset = document.getElementById(SPLIT_PANE_ID).clientWidth + gutterWidth;
            toolbar.style.right = `${offset}px`;
        } else if (toolbar) {
            toolbar.style.right = '0';
        }

        window.dispatchEvent(new Event('resize'));
    };

    handleSplit = () => {
        this.onResize();
        // fight the table toolbar becoming invisible after toggling YQLWidget and before first scroll
        window.dispatchEvent(new Event('scroll'));
        this.updateWidthModifier();
    };

    updateWidthModifier() {
        const currentWidth = this.contentPaneRef.current?.clientWidth || Infinity;
        if (currentWidth <= 720) {
            this.setState({width: 'small'});
        } else if (currentWidth <= 1024) {
            this.setState({width: 'medium'});
        } else {
            this.setState({width: 'large'});
        }
    }

    onResizeEnd = (sizes) => {
        this.props.setSetting(
            SettingName.NAVIGATION.CLUSTER_PAGE_PANE_SIZES,
            NAMESPACES.NAVIGATION,
            sizes,
        );
        this.updateWidthModifier();
    };

    getInitialSizes = () => {
        return this.props.clusterPagePaneSizes;
    };

    isParamsLoading() {
        const {cluster, paramsCluster} = this.props;
        return cluster !== paramsCluster;
    }

    renderContent(clusterConfig) {
        const {
            cluster,
            startingPage,
            isLoaded,
            hasError,
            paramsError,
            allowChyt,
            allowStartPageRedirect,
            isNewDashboardPage,
        } = this.props;

        return isLoaded && !this.isParamsLoading() ? (
            <Fragment>
                <SupportedFeaturesUpdater />
                <RedirectToBanIfNeededMemo to={`/${cluster}/${Page.BAN}`} />
                <Switch>
                    <Route path={`/:cluster/${Page.BAN}`} component={BanPageLazy} />
                    <Route path={`/:cluster/${Page.COMPONENTS}`} component={ComponentsLazy} />
                    <Route path={`/:cluster/${Page.OPERATIONS}`} component={OperationsLazy} />
                    <Route path={`/:cluster/${Page.JOB}`} component={JobLazy} />
                    <Route
                        path={`/:cluster/${Page.DASHBOARD}`}
                        component={isNewDashboardPage ? Dashboard2Lazy : DashboardLazy}
                    />
                    <Route path={`/:cluster/${Page.SYSTEM}`} component={SystemLazy} />
                    <Route path={`/:cluster/${Page.ACCOUNTS}`} component={AccountsLazy} />
                    <Route
                        path={[
                            `/:cluster/${Page.TABLET_CELL_BUNDLES}`,
                            `/:cluster/${Page.CHAOS_CELL_BUNDLES}`,
                        ]}
                        component={TabletCellBundlesLazy}
                    />
                    <Route path={`/:cluster/${Page.NAVIGATION}`} component={NavigationLazy} />
                    <Route path={`/:cluster/${Page.FLOW}`} component={FlowPageLazy} />
                    <Route path={`/:cluster/${Page.PATH_VIEWER}`} component={PathViewerLazy} />
                    <Route path={`/:cluster/${Page.TABLET}`} component={TabletLazy} />
                    <Route path={`/:cluster/${Page.USERS}`} component={UsersPageLazy} />
                    <Route path={`/:cluster/${Page.GROUPS}`} component={GroupsPageLazy} />
                    <Route path={`/:cluster/${Page.SCHEDULING}`} component={SchedulingLazy} />
                    {allowChyt && (
                        <Route path={`/:cluster/${Page.CHYT}`} component={ChytPageLazy} />
                    )}
                    <Route path={`/:cluster/${Page.QUERIES}`} component={QueryTrackerLazy} />
                    {hasOdinPage() && (
                        <Route
                            path={`/:cluster/${odinPageInfo.pageId}`}
                            component={odinPageInfo.reactComponent}
                        />
                    )}

                    <Redirect
                        from={`/:cluster/${Page.VERSIONS}`}
                        to={`/:cluster/${Page.COMPONENTS}/versions`}
                    />
                    {makeExtraPageRoutes()}
                    {allowStartPageRedirect && (
                        <Redirect from={`/${cluster}/`} to={`/${cluster}/${startingPage}`} />
                    )}
                </Switch>

                <Route path="/:cluster/:page/:tab?" component={PageTracker} />
            </Fragment>
        ) : (
            <React.Fragment>
                <div className={b('preloader')}>
                    {hasError ? (
                        <PreloadError />
                    ) : (
                        <p className={b('loading-text')}>Loading {clusterConfig?.id}...</p>
                    )}
                </div>
                <div className={b('error')}>
                    {paramsError && <YTErrorBlock error={paramsError} />}
                </div>
            </React.Fragment>
        );
    }

    render() {
        const {cluster, splitScreen, clusters} = this.props;

        // TODO: put current cluster config into redux state to avoid doing things like these here
        const clusterConfig = getClusterConfig(clusters, cluster);

        // FIXME: handle case when clusterConfig is undefined due to wrong cluster name
        return (
            <ClusterMaintenanceContext cluster={cluster}>
                <ClusterPageStopRumMeasure />
                <PageHeadByCluster cluster={cluster} />

                <ClusterPageHeader cluster={cluster} />

                <FlexSplitPane
                    className={b('panes-wrapper', {
                        'with-pane': splitScreen.isSplit,
                    })}
                    paneClassNames={splitScreen.paneClassNames}
                    direction={FlexSplitPane.HORIZONTAL}
                    onResize={this.onResize}
                    onResizeEnd={this.onResizeEnd}
                    onSplit={this.handleSplit}
                    onUnSplit={this.handleSplit}
                    getInitialSizes={this.getInitialSizes}
                    id={SPLIT_PANE_ID}
                    forceSplit={splitScreen.isSplit}
                >
                    <div
                        ref={this.contentPaneRef}
                        className={b('content-pane', {
                            split: splitScreen.isSplit && 'yes',
                            width: this.state.width,
                        })}
                    >
                        <ElementWidthAsCssVariable
                            className={b('content-pane')}
                            element={splitScreen.isSplit ? this.contentPaneRef.current : undefined}
                            cssVariableName="--yt-with-sticky-toolbar-fixed-max-width"
                        />
                        <ScrollableElementContext.Provider
                            value={splitScreen.isSplit ? this.contentPaneRef.current : undefined}
                        >
                            <HandleMaintenance cluster={cluster}>
                                {this.renderContent(clusterConfig)}
                            </HandleMaintenance>
                        </ScrollableElementContext.Provider>
                    </div>
                </FlexSplitPane>
            </ClusterMaintenanceContext>
        );
    }
}

function mapStateToProps(state) {
    const {login, splitScreen, loadState, error, paramsCluster, paramsLoading, paramsError} =
        state.global;

    const clusters = state.clustersMenu.clusters;

    return {
        clusters,
        isLoaded: !paramsLoading && loadState === LOADING_STATUS.LOADED,
        hasError: loadState === LOADING_STATUS.ERROR,
        error,
        paramsError,
        login,
        splitScreen,
        clusterPagePaneSizes: getClusterPagePaneSizes(state),
        startingPage: getStartingPage(state),
        paramsCluster,
        allowChyt: Boolean(getClusterUiConfig(state).chyt_controller_base_url),
        allowStartPageRedirect: isExperimentalPagesReady(state),
        isNewDashboardPage: getSettingNewDashboardPage(state),
    };
}

const mapDispatchToProps = {
    setSetting,
    trackVisit,
    splitMenuItemsAction,
    joinMenuItemsAction,
    updateTitle,
    updateCluster,
    unmountCluster,
};

export default connect(mapStateToProps, mapDispatchToProps)(ClusterPage);

function RedirectToBanIfNeeded({to}) {
    const {blocked, banned} = useSelector((state) => state.global);
    const {pathname} = useLocation();
    const enableRedirect = (banned || blocked) && !pathname.endsWith('/ban');

    if (!enableRedirect) {
        return null;
    }

    return <Redirect to={to} />;
}

function ClusterPageStopRumMeasure() {
    const loadState = useSelector((state) => state.global.loadState);
    const paramsLoading = useSelector((state) => state.global.paramsLoading);

    const isLoaded =
        loadState === LOADING_STATUS.ERROR ||
        (!paramsLoading && loadState === LOADING_STATUS.LOADED);

    const cluster = useClusterFromLocation();

    useRumMeasureStart({
        type: RumMeasureTypes.CLUSTER_PARAMS,
        subPage: `ui.${cluster}`,
        allowStop: ([isLoaded]) => !isLoaded,
        startDeps: [isLoaded],
    });

    useRumMeasureStop({
        type: RumMeasureTypes.CLUSTER_PARAMS,
        allowStop: ([isLoaded]) => isLoaded,
        stopDeps: [isLoaded],
    });
    return null;
}
