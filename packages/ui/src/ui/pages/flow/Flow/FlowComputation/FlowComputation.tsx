import cn from 'bem-cn-lite';
import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router';
import {Page} from '../../../../../shared/constants/settings';
import Tabs from '../../../../components/Tabs/Tabs';
import {FlowEntityTitle} from '../../../../pages/flow/flow-components/FlowEntityHeader';
import {FlowError} from '../../../../pages/flow/flow-components/FlowError/FlowError';
import {FlowMessagesCollapsible} from '../../../../pages/flow/flow-components/FlowMessagesCollapsible/FlowMessagesCollapsible';
import {
    FlowPathMeta,
    getLoadedDataMetaItems,
} from '../../../../pages/flow/flow-components/FlowMeta/FlowMeta';
import {useFlowExecuteQuery} from '../../../../store/api/yt';
import {filtersSlice} from '../../../../store/reducers/flow/filters';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import {getCluster} from '../../../../store/selectors/global/cluster';
import UIFactory from '../../../../UIFactory';
import './FlowComputation.scss';
import {FlowComputationPartitions} from './FlowComputationPartitions';
import {FlowComputationPerformance} from './FlowComputationPerformance/FlowComputationPerformance';
import {FlowPartition} from './FlowPartition/FlowPartition';
import i18n from './i18n';

const block = cn('yt-flow-computation');

export function FlowComputation() {
    const dispatch = useDispatch();
    const {
        path,
        params: {computation: computationRaw},
    } = useRouteMatch<{computation: string}>();

    const computation = decodeURIComponent(computationRaw);

    React.useEffect(() => {
        dispatch(filtersSlice.actions.updateFlowFilters({currentComputation: computation}));
        return () => {
            dispatch(filtersSlice.actions.updateFlowFilters({currentComputation: ''}));
        };
    }, [computation, dispatch]);

    const monitoringComponent = UIFactory.getMonitoringComponentForFlowComputation();

    return (
        <div className={block()}>
            <Switch>
                <Route
                    exact
                    path={`${path}/details`}
                    render={() => <FlowComputationDetails computation={computation} />}
                />
                <Route exact path={`${path}/partition/:partition?`} component={FlowPartition} />
                {Boolean(monitoringComponent) && (
                    <Route
                        exact
                        path={`${path}/monitor`}
                        render={() => <FlowComputationMonitor computation={computation} />}
                    />
                )}
            </Switch>
        </div>
    );
}

function FlowComputationTabs({computation}: {computation: string}) {
    const cluster = useSelector(getCluster);

    return (
        <Tabs
            routed
            routedPreserveLocation
            className={block('tabs')}
            underline={true}
            size="l"
            items={[
                {
                    value: 'details',
                    text: i18n('details'),
                    url: `/${cluster}/${Page.FLOWS}/computations/${encodeURIComponent(computation)}/details`,
                    routed: true,
                    show: true,
                },
                {
                    value: 'monitor',
                    text: i18n('monitoring'),
                    url: `/${cluster}/${Page.FLOWS}/computations/${encodeURIComponent(computation)}/monitor`,
                    show: true,
                },
            ]}
        />
    );
}

function FlowComputationDetails({computation}: {computation: string}) {
    const pipeline_path = useSelector(getFlowPipelinePath);

    const {data, error, isLoading} = useFlowComputationData({computation, pipeline_path});

    const scrollToRef = React.useRef<HTMLDivElement>(null);
    const onClick = React.useCallback(() => {
        scrollToRef.current?.scrollIntoView();
    }, []);

    return (
        <>
            <FlowEntityTitle
                title={computation}
                status={data?.status}
                loading={!data && isLoading}
            />
            <FlowComputationMeta computation={computation} pipeline_path={pipeline_path} />
            <FlowComputationTabs computation={computation} />
            {Boolean(error) && <FlowError error={error} />}
            <FlowComputationPerformance data={data} onClick={onClick} />
            <div className={block('messages')}>
                <FlowMessagesCollapsible messages={data?.messages} />
            </div>
            <FlowComputationPartitions partitions={data?.partitions} />
            <div ref={scrollToRef} />
        </>
    );
}

function FlowComputationMeta({
    computation,
    pipeline_path,
}: {
    computation: string;
    pipeline_path: string;
}) {
    const {data} = useFlowComputationData({computation, pipeline_path});

    return data ? (
        <FlowPathMeta items={getLoadedDataMetaItems({label: i18n('computation-data'), data})} />
    ) : null;
}

function useFlowComputationData({
    computation,
    pipeline_path,
}: {
    computation: string;
    pipeline_path: string;
}) {
    return useFlowExecuteQuery<'describe-computation'>({
        parameters: {
            flow_command: 'describe-computation',
            pipeline_path,
        },
        body: {
            computation_id: computation,
        },
    });
}

function FlowComputationMonitor({computation}: {computation: string}) {
    const pipeline_path = useSelector(getFlowPipelinePath);
    const ComputationMonitoring = UIFactory.getMonitoringComponentForFlowComputation();

    const {data, error} = useFlowComputationData({computation, pipeline_path});

    if (!ComputationMonitoring) {
        return null;
    }

    return (
        <div className={block()}>
            <FlowEntityTitle title={computation} status={data?.status} />
            <FlowComputationTabs computation={computation} />
            {Boolean(error) && <FlowError error={error} />}
            <ComputationMonitoring path={pipeline_path} computation={computation} />
        </div>
    );
}
