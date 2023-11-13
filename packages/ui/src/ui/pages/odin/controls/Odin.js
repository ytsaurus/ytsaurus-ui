import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {connect, useDispatch, useSelector} from 'react-redux';
import block from 'bem-cn-lite';
import {Redirect, Route, Switch, useRouteMatch} from 'react-router';

import Message from '../../../components/Message/Message';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import ClusterSelectControl from '../../../components/Dialog/controls/ClusterSelectControl/ClusterSelectControl';
import {setRootPagesCluster} from '../../../store/actions/global';
import {getCluster, getUISizes} from '../../../store/selectors/global';
import Tabs from '../../../components/Tabs/Tabs';
import {ODIN_PAGE_ID, OdinTab} from '../odin-constants';
import {makeTabProps} from '../../../utils';
import OdinOverview from './OdinOverview';
import Toolbar from './OdinToolbar';
import Monitor from './OdinMonitor';

import Utils from '../odin-utils';
import {useUpdater} from '../../../hooks/use-updater';
import {loadMetricAvailability, setOdinCluster} from '../_actions';
import {
    ODIN_CLUSTER_NAMES_ITEMS,
    getDate,
    getMetric,
    getOdinCluster,
    getUseCurrentDate,
} from '../_selectors';
import {GENERIC_ERROR_MESSAGE} from '../../../constants/index';

import {setOdinLastVisitedTab} from '../_actions/odin-overview';
import {getOdinLastVisitedTab} from '../_selectors/odin-overview';
import {CreateNotificationButton} from '../../system/System/SystemTopRowContent';
import YT from '../../../config/yt-config';
import RootPage from '../../../containers/RootPage/RootPage';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';

import './Odin.scss';

const odinCN = block('odin');

function useLoadMetricAvailability(cluster) {
    const dispatch = useDispatch();
    const date = useSelector(getDate);
    const useCurrentDate = useSelector(getUseCurrentDate);
    const metric = useSelector(getMetric);

    const updateFn = React.useMemo(() => {
        if (useCurrentDate) {
            return () => {
                dispatch(loadMetricAvailability({cluster, metric, date}));
            };
        } else {
            dispatch(loadMetricAvailability({cluster, metric, date}));
            return undefined;
        }
    }, [dispatch, cluster, useCurrentDate, date, metric]);

    useUpdater(updateFn, {timeout: 60 * 1000});
}

function OdinDetails({cluster}) {
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(setOdinLastVisitedTab(OdinTab.DETAILS));
    }, []);
    useLoadMetricAvailability(cluster);

    return (
        <WithStickyToolbar
            toolbar={<Toolbar className={odinCN('toolbar')} />}
            content={<Monitor />}
        />
    );
}

function useCheckOdinStatus(cluster) {
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (cluster) {
            Utils.checkStatus(cluster)
                .then((status) => {
                    setStatus(status ? 'available' : 'unavailable');
                })
                .catch(() => {
                    setStatus('error');
                });
        } else {
            setStatus('');
        }
    }, [cluster]);

    return status;
}

OdinTabs.propTypes = {
    cluster: PropTypes.string,
};

function OdinTabs({cluster}) {
    const match = useRouteMatch();
    const lastVisitedTab = useSelector(getOdinLastVisitedTab);
    const {tabSize} = useSelector(getUISizes);

    const props = makeTabProps(match.url, OdinTab);

    return (
        <React.Fragment>
            <Tabs
                className={odinCN('tabs')}
                {...props}
                routed
                routedPreserveLocation
                size={tabSize}
            />
            <Switch>
                <Route path={`${match.path}/details`}>
                    <OdinDetails cluster={cluster} />
                </Route>
                <Route path={`${match.path}/overview`}>
                    <OdinOverview cluster={cluster} />
                </Route>
                <Redirect from={match.path} to={`${match.path}/${lastVisitedTab}`} />
            </Switch>
        </React.Fragment>
    );
}

Odin.propTypes = {
    cluster: PropTypes.string,
    clusters: PropTypes.array,
};

function Odin({cluster, clusters}) {
    const status = useCheckOdinStatus(cluster);
    const dispatch = useDispatch();

    React.useLayoutEffect(() => {
        setTimeout(() => dispatch(setRootPagesCluster(cluster)), 1);
        return () => {
            dispatch(setRootPagesCluster(''));
        };
    }, [dispatch, cluster]);

    return (
        <ErrorBoundary>
            <div className={odinCN(null, 'elements-main-section')}>
                {clusters && (
                    <div className={odinCN('cluster-toolbar')}>
                        <ClusterSelectControl
                            className={odinCN('cluster-picker')}
                            value={cluster}
                            onChange={(newValue) => dispatch(setOdinCluster(newValue))}
                            placeholder={'Enter cluster name'}
                            clusters={clusters}
                            width="max"
                        />
                        {cluster && (
                            <CreateNotificationButton clusterConfig={YT.clusters[cluster]} />
                        )}
                    </div>
                )}
                {cluster && status === 'available' && <OdinTabs cluster={cluster} />}
                {cluster && status === 'unavailable' && (
                    <Message
                        theme="warning"
                        content={['Odin is not supported on this cluster.', GENERIC_ERROR_MESSAGE]}
                    />
                )}
                {cluster && status === 'error' && (
                    <Message
                        theme="error"
                        content={['Odin could not be reached.', GENERIC_ERROR_MESSAGE]}
                    />
                )}
            </div>
        </ErrorBoundary>
    );
}

IndependentOdinImpl.propTypes = {
    name: PropTypes.string,
    cluster: PropTypes.string,
    clusters: PropTypes.array,
};

function IndependentOdinImpl({clusters, cluster, name}) {
    const title = name ? `Odin - ${name}` : 'Odin';

    return (
        <RootPage title={title} currentPathname={`/${ODIN_PAGE_ID}`}>
            <div className={odinCN('landing')}>
                <Odin showClusterControl cluster={cluster} clusters={clusters} />
            </div>
        </RootPage>
    );
}

const mapIndependentOdinStateToProps = (state) => {
    const cluster = getOdinCluster(state);
    const {name} = window.YT.clusters[cluster] || {name: cluster};
    return {
        name,
        cluster,
        clusters: ODIN_CLUSTER_NAMES_ITEMS,
    };
};

export const IndependentOdin = connect(mapIndependentOdinStateToProps)(IndependentOdinImpl);

const mapOdinStateToProps = (state) => {
    return {
        cluster: getCluster(state),
    };
};

export default connect(mapOdinStateToProps)(Odin);
