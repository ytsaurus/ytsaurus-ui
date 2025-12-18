import cn from 'bem-cn-lite';
import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router';
import {YTErrorBlock} from '../../../../components/Error/Error';
import {FlowEntityTitle} from '../../../../pages/flow/flow-components/FlowEntityHeader';
import {FlowMessagesCollapsible} from '../../../../pages/flow/flow-components/FlowMessagesCollapsible/FlowMessagesCollapsible';
import {useFlowExecuteQuery} from '../../../../store/api/yt';
import {filtersSlice} from '../../../../store/reducers/flow/filters';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import './FlowComputation.scss';
import {FlowComputationPartitions} from './FlowComputationPartitions';
import {FlowComputationPerformance} from './FlowComputationPerformance/FlowComputationPerformance';
import {FlowPartition} from './FlowPartition/FlowPartition';

const block = cn('yt-flow-computation');

export function FlowComputation() {
    const dispatch = useDispatch();
    const {
        params: {computation},
    } = useRouteMatch<{computation: string}>();

    React.useEffect(() => {
        dispatch(filtersSlice.actions.updateFlowFilters({currentComputation: computation}));
        return () => {
            dispatch(filtersSlice.actions.updateFlowFilters({currentComputation: ''}));
        };
    }, [computation, dispatch]);

    return <FlowComputationDetails computation={computation} />;
}

function FlowComputationDetails({computation}: {computation: string}) {
    const pipeline_path = useSelector(getFlowPipelinePath);

    const {data, error} = useFlowComputationData({computation, pipeline_path});
    return (
        <div className={block()}>
            <FlowEntityTitle title={computation} status={data?.status} />
            {Boolean(error) && <YTErrorBlock error={error} />}
            <FlowComputationPerformance data={data} />
            <div className={block('messages')}>
                <FlowMessagesCollapsible messages={data?.messages} />
            </div>
            <FlowComputationPartitions data={data} />
        </div>
    );
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
