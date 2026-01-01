import cn from 'bem-cn-lite';
import React from 'react';
import {useRouteMatch} from 'react-router';
import {FlowPartitionDetailsType} from '../../../../../../shared/yt-types';
import format from '../../../../../common/hammer/format';
import {YTErrorBlock} from '../../../../../components/Error/Error';
import Link from '../../../../../components/Link/Link';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import {FlowEntityTitle} from '../../../../../pages/flow/flow-components/FlowEntityHeader';
import {FlowMessagesCollapsible} from '../../../../../pages/flow/flow-components/FlowMessagesCollapsible/FlowMessagesCollapsible';
import {useFlowExecuteQuery} from '../../../../../store/api/yt/flow/index';
import {filtersSlice} from '../../../../../store/reducers/flow/filters';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../../store/selectors/flow/filters';
import i18n from './i18n';

const block = cn('yt-flow-partition');

export function FlowPartition() {
    const dispatch = useDispatch();
    const {
        params: {partition},
    } = useRouteMatch<{partition: string}>();

    const pipeline_path = useSelector(getFlowPipelinePath);

    const {data, error, isLoading} = useFlowExecuteQuery<'describe-partition'>({
        parameters: {
            flow_command: 'describe-partition',
            pipeline_path,
        },
        body: {
            partition_id: partition,
        },
    });

    React.useEffect(() => {
        dispatch(filtersSlice.actions.updateFlowFilters({currentPartition: partition}));
        return () => {
            dispatch(filtersSlice.actions.updateFlowFilters({currentPartition: ''}));
        };
    }, [partition, dispatch]);

    return (
        <div className={block()}>
            <FlowEntityTitle
                title={i18n('partition')}
                status={data?.status}
                loading={isLoading && !data}
            />
            <FlowPartitionMeta data={data} partition={partition} />
            {Boolean(error) && <YTErrorBlock error={error} />}
            <FlowMessagesCollapsible messages={data?.messages} />
        </div>
    );
}

export function FlowPartitionMeta({
    data,
    partition,
}: {
    partition: string;
    data?: FlowPartitionDetailsType;
}) {
    const hasData = Boolean(data);
    return (
        <MetaTable
            items={[
                [
                    {
                        key: i18n('partition-id'),
                        value: data?.partition_id ?? partition,
                    },
                    {
                        key: i18n('computation-id'),
                        value: data?.computation_id,
                        visible: hasData,
                    },
                    {
                        key: i18n('current-job-id'),
                        value: data?.current_job_id,
                        visible: hasData,
                    },
                    {
                        key: i18n('current-worker-address'),
                        value: data?.current_worker_address,
                        visible: hasData,
                    },
                    {
                        key: i18n('incarnation-id'),
                        value: data?.current_worker_incarnation_id,
                        visible: hasData,
                    },
                ],
                [
                    {
                        key: i18n('tracing'),
                        value: <Link url={data?.tracing_address}>{i18n('tracing')}</Link>,
                    },
                    {
                        key: i18n('cpu-usage'),
                        value: format.NumberSmart(data?.cpu_usage),
                        visible: hasData,
                    },
                    {
                        key: i18n('memory-usage'),
                        value: format.Bytes(data?.memory_usage),
                        visible: hasData,
                    },
                    {
                        key: i18n('message-per-second'),
                        value: format.NumberWithSuffix(data?.messages_per_second),
                        visible: hasData,
                    },
                    {
                        key: i18n('bytes-per-second'),
                        value: format.Bytes(data?.bytes_per_second),
                        visible: hasData,
                    },
                ],
            ]}
        />
    );
}
