import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {useRouteMatch} from 'react-router';
import {FlowComputationType} from '../../../../../shared/yt-types';
import CollapsibleSection from '../../../../components/CollapsibleSection/CollapsibleSection';
import {YTErrorBlock} from '../../../../components/Error/Error';
import {useFlowExecuteQuery} from '../../../../store/api/yt';
import {filtersSlice} from '../../../../store/reducers/flow/filters';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import {FlowMessagesContent, FlowNodeStatus} from '../FlowGraph/renderers/FlowGraphRenderer';
import './FlowComputation.scss';
import {FlowComputationPartitions} from './FlowComputationPartitions';
import i18n from './i18n';

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
            <Flex gap={1} alignItems="baseline">
                <Text variant="header-2">{computation}</Text>
                {data?.status ? (
                    <span>
                        <FlowNodeStatus status={data.status} />{' '}
                    </span>
                ) : null}
            </Flex>
            {Boolean(error) && <YTErrorBlock error={error} />}
            <div className={block('messages')}>
                <FlowComputationMessages messages={data?.messages} />
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

function FlowComputationMessages({messages}: {messages?: FlowComputationType['messages']}) {
    return messages?.length ? (
        <CollapsibleSection name={i18n('messages')}>
            <FlowMessagesContent data={messages} />
        </CollapsibleSection>
    ) : null;
}
