import {useDispatch, useSelector} from 'react-redux';
import {Redirect, Route, RouteComponentProps, Switch} from 'react-router';
import React from 'react';
import cn from 'bem-cn-lite';

import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import Tabs from '../../../../components/Tabs/Tabs';
import Loader from '../../../../components/Loader/Loader';
import NodeGeneralTab from '../../../../pages/components/tabs/node/NodeGeneralTab/NodeGeneralTab';
import NodeMemoryUsage from '../../../../pages/components/tabs/node/NodeMemoryUsage/NodeMemoryUsage';
import {NodeTab} from '../../../../constants/components/nodes/node';
import {loadNodeAttributes} from '../../../../store/actions/components/node/node';
import Updater from '../../../../utils/hammer/updater';
import {makeTabProps} from '../../../../utils';
import type {RootState} from '../../../../store/reducers';
import {getNodeAlertCount, nodeSelector} from '../../../../store/selectors/components/node/node';
import {getSortedItems} from '../../../../store/selectors/components/nodes/node-card';
import NodeMeta from './NodeMeta/NodeMeta';

import './NodePage.scss';
import NodeAlerts from './NodeAlerts/NodeAlerts';
import NodeLocations from './NodeLocations/NodeLocations';
import NodeTabletSlotsTab from './NodeTabletSlotsTab/NodeTabletSlotsTab';

const block = cn('node-page');
const updater = new Updater();

interface RouteParams {
    host: string;
}

export interface NodeDetailsProps extends RouteComponentProps<RouteParams> {}

function NodePage({match}: NodeDetailsProps): ReturnType<React.VFC> {
    const dispatch = useDispatch();

    const {node, loading, loaded, error, errorData} = useSelector(nodeSelector);

    const host = decodeURIComponent(match.params.host);
    const alertCount = useSelector(getNodeAlertCount);

    React.useEffect(() => {
        const loadHandler = () => dispatch(loadNodeAttributes(host));

        updater.add('node', loadHandler, 15 * 1000);

        return () => {
            updater.remove('node');
            // dispatch(abortAndReset());
        };
    }, [dispatch, host]);

    const initialLoading = loading && (!loaded || host !== node?.host);

    const tabletSlots = useSelector((state: RootState) => node && getSortedItems(state, {node}));

    const matchUrl = match.url;
    const tabProps = React.useMemo(
        () =>
            makeTabProps(
                matchUrl,
                NodeTab,
                {
                    [NodeTab.MEMORY_USAGE]: {show: Boolean(node && tabletSlots.length > 0)},
                    [NodeTab.LOCATIONS]: {show: Boolean(node?.locations?.length)},
                    [NodeTab.TABLET_SLOTS]: {show: Boolean(node && tabletSlots.length > 0)},
                    [NodeTab.ALERTS]: {show: Boolean(alertCount), counter: alertCount},
                },
                null,
                {
                    [NodeTab.GENERAL]: 'General',
                    [NodeTab.MEMORY_USAGE]: 'Memory usage',
                },
            ),
        [matchUrl, alertCount, tabletSlots],
    );

    return (
        <div className={block()}>
            <div className={block('content', {loading: initialLoading})}>
                <LoadDataHandler loaded={loaded} error={error} errorData={errorData}>
                    <div className={block()}>
                        <div className={block('host', 'elements-heading elements-heading_size_l')}>
                            {host}
                            <ClipboardButton text={host} size="l" view="flat-secondary" />
                            {<Loader visible={initialLoading} />}
                        </div>
                        {!initialLoading && (
                            <React.Fragment>
                                <div className={block('meta')}>
                                    {node && <NodeMeta {...node} />}
                                </div>

                                <div className={block('heading', 'elements-section')}>
                                    <Tabs {...tabProps} routed />
                                </div>

                                <Switch>
                                    <Route
                                        path={`${match.path}/${NodeTab.GENERAL}`}
                                        component={NodeGeneralTab}
                                    />
                                    <Route
                                        path={`${match.path}/${NodeTab.MEMORY_USAGE}`}
                                        component={NodeMemoryUsage}
                                    />
                                    <Route
                                        path={`${match.path}/${NodeTab.LOCATIONS}`}
                                        component={NodeLocations}
                                    />
                                    <Route
                                        path={`${match.path}/${NodeTab.TABLET_SLOTS}`}
                                        component={NodeTabletSlotsTab}
                                    />
                                    <Route
                                        path={`${match.path}/${NodeTab.ALERTS}`}
                                        render={() => <NodeAlerts />}
                                    />
                                    <Redirect
                                        from={match.url}
                                        to={`${match.url}/${NodeTab.GENERAL}`}
                                    />
                                </Switch>
                            </React.Fragment>
                        )}
                    </div>
                </LoadDataHandler>
            </div>
        </div>
    );
}

export default React.memo(NodePage);
