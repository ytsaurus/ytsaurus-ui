import React, {Component, Fragment} from 'react';
import {Redirect, Route, Switch, useLocation} from 'react-router';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import BanPage from '../BanPage/BanPage';
import MaintenancePage from '../MaintenancePage/MaintenancePage';
import HandleMaintenanceRedirect from '../MaintenancePage/HandleRedirect';
import Components from '../../pages/components/Components/Components';
import Operations from '../../pages/operations/Operations/Operations';
import Accounts from '../../pages/accounts/Accounts/Accounts';
import Dashboard from '../../pages/dashboard/Dashboard/Dashboard';
import System from '../../pages/system/System/System';
import Navigation from '../../pages/navigation/Navigation/Navigation';
import PathViewer from '../../pages/path-viewer/PathViewer';
import Tablet from '../../pages/tablet/Tablet';
import TabletCellBundles from '../../pages/tablet_cell_bundles/TabletCellBundles';
import GroupsPage from '../../pages/groups/GroupsPage';
import UsersPage from '../../pages/users/UsersPage';
import Scheduling from '../../pages/scheduling/Scheduling/Scheduling';
import QueryTracker from '../../pages/query-tracker/QueryTracker';
import Job from '../../pages/job/Job';

import ClusterPageHeader from '../ClusterPageHeader/ClusterPageHeader';
import PageTracker from './PageTracker';

import {PageHeadByCluster} from '../../components/PageHead/PageHead';
import ConnectionErrorRegion from '../../components/PreloaderErrors/ConnectionErrorRegion';
import GeneralErrorRegion from '../../components/PreloaderErrors/GeneralErrorRegion';
import FlexSplitPane from '../../components/FlexSplitPane/FlexSplitPane';
import ErrorBlock from '../../components/Error/Error';

import {LOADING_STATUS, LOAD_ERROR, Page, SPLIT_PANE_ID} from '../../constants/index';
import {joinMenuItemsAction, splitMenuItemsAction, trackVisit} from '../../store/actions/menu';
import {setSetting} from '../../store/actions/settings';
import {initClusterParams, updateCluster} from '../../store/actions/cluster-params';
import {updateTitle} from '../../store/actions/global';
import {isQueryTrackerAllowed} from '../../store/selectors/global';
import {getClusterConfig} from '../../utils';
import {NAMESPACES, SettingName} from '../../../shared/constants/settings';
import {
    getClusterPagePaneSizes,
    getStartingPage,
    isRecentClustersFirst,
    isRecentPagesFirst,
    isRedirectToBetaSwitched,
} from '../../store/selectors/settings';
import SupportedFeaturesUpdater from './SupportedFeaturesUpdater';
import {useRumMeasureStart, useRumMeasureStop} from '../../rum/RumUiContext';
import {RumMeasureTypes} from '../../rum/rum-measure-types';
import {useClusterFromLocation} from '../../hooks/use-cluster';
import {makeExtraPageRoutes} from './ExtraClusterPageRoutes';
import {odinPageInfo} from '../../pages/odin';
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
        maintenancePageEvent: PropTypes.object,
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
        initClusterParams: PropTypes.func.isRequired,
        updateCluster: PropTypes.func.isRequired,
        updateTitle: PropTypes.func.isRequired,
        trackVisit: PropTypes.func.isRequired,

        allowQueryTracker: PropTypes.bool,
    };

    state = {
        width: 'large',
    };

    componentDidMount() {
        const {cluster} = this.props;
        this.props.updateCluster(cluster, this._onUpdateEnd);
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
            this.props.updateCluster(cluster, this._onUpdateEnd);
        }
    }

    componentWillUnmount() {
        this.props.updateTitle({path: '', page: ''});
    }

    contentPaneRef = React.createRef();

    _onUpdateEnd = () => {
        const {
            cluster,
            trackVisit,
            updateTitle,
            initClusterParams,
            isRedirectToBetaSwitched,
            setSetting,
        } = this.props;

        return Promise.resolve().then(() => {
            // todo: get rid of redirectToBetaSwitched setting.
            // It`s exist for set default value of redirectToBeta setting, when settings document is empty yet.
            // Set redirectToBeta on server after get all user settings (home.js). Or get rid of this logic at all.
            if (!isRedirectToBetaSwitched) {
                setSetting(
                    SettingName.DEVELOPMENT.REDIRECT_TO_BETA_SWITCHED,
                    NAMESPACES.DEVELOPMENT,
                    true,
                );
                setSetting(SettingName.DEVELOPMENT.REDIRECT_TO_BETA, NAMESPACES.DEVELOPMENT, true);
            }

            initClusterParams(cluster);
            this._initMenuCollection('cluster');
            this._initMenuCollection('page');
            trackVisit('cluster', cluster);
            updateTitle({cluster});
        });
    };

    _initMenuCollection(itemName) {
        const {splitMenuItemsAction, joinMenuItemsAction} = this.props;

        const settingsMap = {
            cluster: 'isRecentClustersFirst',
            page: 'isRecentPagesFirst',
        };

        if (this.props[settingsMap[itemName]]) {
            splitMenuItemsAction(itemName);
        } else {
            joinMenuItemsAction(`${itemName}s`);
        }
    }

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

    renderError(clusterConfig) {
        const {errorType} = this.props.error || {};

        switch (errorType) {
            case LOAD_ERROR.CONNECTION:
                return <ConnectionErrorRegion cluster={clusterConfig.id} />;
            case LOAD_ERROR.AUTHENTICATION:
                return (
                    <GeneralErrorRegion
                        cluster={clusterConfig.id}
                        message={
                            'Could not fetch the XSRF token, therefore preventing further operations. Sometimes ' +
                            'token fetching fails due to the network issues. If the  problem persists, please report it ' +
                            'via Bug Reporter.'
                        }
                    />
                );
            case LOAD_ERROR.GENERAL:
                return (
                    <GeneralErrorRegion message="Unexpected error occurred. If problem persists please report it via Bug Reporter." />
                );
        }
    }

    isParamsLoading() {
        const {cluster, paramsCluster} = this.props;
        return cluster !== paramsCluster;
    }

    renderContent(clusterConfig) {
        const {cluster, startingPage, isLoaded, hasError, paramsError, allowQueryTracker} =
            this.props;

        return isLoaded && !this.isParamsLoading() ? (
            <Fragment>
                <SupportedFeaturesUpdater />
                <HandleMaintenanceRedirect />
                <RedirectToBanIfNeededMemo to={`/${cluster}/${Page.BAN}`} />
                <Switch>
                    <Route path={`/:cluster/${Page.BAN}`} component={BanPage} />
                    <Route path={`/:cluster/${Page.MAINTENANCE}`} component={MaintenancePage} />
                    <Route path={`/:cluster/${Page.COMPONENTS}`} component={Components} />
                    <Route path={`/:cluster/${Page.OPERATIONS}`} component={Operations} />
                    <Route path={`/:cluster/${Page.JOB}`} component={Job} />
                    <Route path={`/:cluster/${Page.DASHBOARD}`} component={Dashboard} />
                    <Route path={`/:cluster/${Page.SYSTEM}`} component={System} />
                    <Route path={`/:cluster/${Page.ACCOUNTS}`} component={Accounts} />
                    <Route
                        path={[
                            `/:cluster/${Page.TABLET_CELL_BUNDLES}`,
                            `/:cluster/${Page.CHAOS_CELL_BUNDLES}`,
                        ]}
                        component={TabletCellBundles}
                    />
                    <Route path={`/:cluster/${Page.NAVIGATION}`} component={Navigation} />
                    <Route path={`/:cluster/${Page.PATH_VIEWER}`} component={PathViewer} />
                    <Route path={`/:cluster/${Page.TABLET}`} component={Tablet} />
                    <Route path={`/:cluster/${Page.USERS}`} component={UsersPage} />
                    <Route path={`/:cluster/${Page.GROUPS}`} component={GroupsPage} />
                    <Route path={`/:cluster/${Page.SCHEDULING}`} component={Scheduling} />
                    {allowQueryTracker && (
                        <Route path={`/:cluster/${Page.QUERIES}`} component={QueryTracker} />
                    )}
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
                    <Redirect from={`/${cluster}/`} to={`/${cluster}/${startingPage}`} />
                </Switch>

                <Route path="/:cluster/:page/:tab?" component={PageTracker} />
            </Fragment>
        ) : (
            <React.Fragment>
                <div className="preloader">
                    {hasError ? (
                        this.renderError(clusterConfig)
                    ) : (
                        <p className="preloader__loading">Loading {clusterConfig?.id}...</p>
                    )}
                </div>
                <div className={b('error')}>
                    {paramsError && <ErrorBlock error={paramsError} />}
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
            <Fragment>
                <ClusterPageStopRumMeasure />
                <PageHeadByCluster cluster={cluster} />

                <ClusterPageHeader />

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
                    minSize={600}
                    getInitialSizes={this.getInitialSizes}
                    id={SPLIT_PANE_ID}
                >
                    <div
                        ref={this.contentPaneRef}
                        className={b('content-pane', {
                            split: splitScreen.isSplit && 'yes',
                            width: this.state.width,
                        })}
                    >
                        {this.renderContent(clusterConfig)}
                    </div>

                    {null}
                </FlexSplitPane>
            </Fragment>
        );
    }
}

function mapStateToProps(state) {
    const {
        login,
        maintenancePageEvent,
        splitScreen,
        loadState,
        error,
        paramsCluster,
        paramsLoading,
        paramsError,
    } = state.global;

    const clusters = state.clustersMenu.clusters;

    return {
        clusters,
        isLoaded: !paramsLoading && loadState === LOADING_STATUS.LOADED,
        hasError: loadState === LOADING_STATUS.ERROR,
        error,
        paramsError,
        login,
        splitScreen,
        maintenancePageEvent,
        isRedirectToBetaSwitched: isRedirectToBetaSwitched(state),
        isRecentClustersFirst: isRecentClustersFirst(state),
        isRecentPagesFirst: isRecentPagesFirst(state),
        clusterPagePaneSizes: getClusterPagePaneSizes(state),
        startingPage: getStartingPage(state),
        paramsCluster,
        allowQueryTracker: isQueryTrackerAllowed(state),
    };
}

const mapDispatchToProps = {
    setSetting,
    trackVisit,
    splitMenuItemsAction,
    joinMenuItemsAction,
    updateTitle,
    initClusterParams,
    updateCluster,
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
