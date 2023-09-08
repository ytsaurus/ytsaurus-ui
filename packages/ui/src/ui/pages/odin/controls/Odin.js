import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {connect, useDispatch, useSelector} from 'react-redux';
import block from 'bem-cn-lite';
import {Redirect, Route, Switch, useRouteMatch} from 'react-router';

import Message from '@ytsaurus/ui/build/esm/ui/components/Message/Message';
import ErrorBoundary from '@ytsaurus/ui/build/esm/ui/components/ErrorBoundary/ErrorBoundary';
import ClusterSelectControl from '@ytsaurus/ui/build/esm/ui/components/Dialog/controls/ClusterSelectControl/ClusterSelectControl';
import {setRootPagesCluster} from '@ytsaurus/ui/build/esm/ui/store/actions/global';
import {getCluster, getUISizes} from '@ytsaurus/ui/build/esm/ui/store/selectors/global';
import Tabs from '@ytsaurus/ui/build/esm/ui/components/Tabs/Tabs';
import {OdinTab} from '../odin-constants';
import {makeTabProps} from '@ytsaurus/ui/build/esm/ui/utils';
import OdinOverview from './OdinOverview';
import Toolbar from './OdinToolbar';
import Monitor from './OdinMonitor';

import Utils from '../odin-utils';
import Updater from '@ytsaurus/ui/build/esm/ui/utils/hammer/updater';
import {loadMetricAvailability, setOdinCluster} from '../_actions';
import {
    getDate,
    getMetric,
    getOdinCluster,
    getOdinClusterNamesAsItems,
    getUseCurrentDate,
} from '../_selectors';
import {GENERIC_ERROR_MESSAGE} from '@ytsaurus/ui/build/esm/ui/constants/index';

import {setOdinLastVisitedTab} from '../_actions/odin-overview';
import {getOdinLastVisitedTab} from '../_selectors/odin-overview';
import {CreateNotificationButton} from '@ytsaurus/ui/build/esm/ui/pages/system/System/SystemTopRowContent';
import YT from '@ytsaurus/ui/build/esm/ui/config/yt-config';
import {odinPageId} from '../../../../../ya-shared/constants';

import './Odin.scss';
import RootPage from '@ytsaurus/ui/build/esm/ui/containers/RootPage/RootPage';
import WithStickyToolbar from '@ytsaurus/ui/build/esm/ui/components/WithStickyToolbar/WithStickyToolbar';

const updater = new Updater();
export const odinCN = block('odin');

function useLoadMetricAvailability(cluster) {
    const dispatch = useDispatch();
    const date = useSelector(getDate);
    const useCurrentDate = useSelector(getUseCurrentDate);
    const metric = useSelector(getMetric);

    useEffect(() => {
        if (useCurrentDate) {
            updater.add(
                'odin.loadMetricAvailability',
                () => {
                    dispatch(loadMetricAvailability(cluster));
                },
                60 * 1000,
            );
        } else {
            dispatch(loadMetricAvailability(cluster));
        }
        return () => {
            updater.remove('odin.loadMetricAvailability');
        };
    }, [useCurrentDate, date, metric]);
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
        <RootPage title={title} currentPathname={`/${odinPageId}`}>
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
        clusters: getOdinClusterNamesAsItems(state),
    };
};

export const IndependentOdin = connect(mapIndependentOdinStateToProps)(IndependentOdinImpl);

const mapOdinStateToProps = (state) => {
    return {
        cluster: getCluster(state),
    };
};

export default connect(mapOdinStateToProps)(Odin);
