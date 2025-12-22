import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {useRouteMatch} from 'react-router';
import {FlowWorkerData} from '../../../../../shared/yt-types';
import format from '../../../../common/hammer/format';
import {YTErrorBlock} from '../../../../components/Error/Error';
import Label from '../../../../components/Label/Label';
import Link from '../../../../components/Link/Link';
import Loader from '../../../../components/Loader/Loader';
import MetaTable, {MetaTableProps} from '../../../../components/MetaTable/MetaTable';
import {FlowEntityTitle} from '../../../../pages/flow/flow-components/FlowEntityHeader';
import {FlowMessagesCollapsible} from '../../../../pages/flow/flow-components/FlowMessagesCollapsible/FlowMessagesCollapsible';
import {FlowComputationPartitions} from '../../../../pages/flow/Flow/FlowComputation/FlowComputationPartitions';
import {useFlowExecuteQuery} from '../../../../store/api/yt/flow';
import {filtersSlice} from '../../../../store/reducers/flow/filters';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import i18n from './i18n';

const block = cn('yt-flow-worker');

export function FlowWorker() {
    const dispatch = useDispatch();

    const {
        params: {worker},
    } = useRouteMatch<{worker: string}>();

    React.useEffect(() => {
        dispatch(filtersSlice.actions.updateFlowFilters({currentWorker: worker}));
        return () => {
            dispatch(filtersSlice.actions.updateFlowFilters({currentWorker: ''}));
        };
    }, [worker, dispatch]);

    return worker ? <FlowWorkerDetails worker={worker} /> : null;
}

function useFlowWorkerData(worker: string) {
    const pipeline_path = useSelector(getFlowPipelinePath);
    return useFlowExecuteQuery<'describe-worker'>({
        parameters: {
            flow_command: 'describe-worker',
            pipeline_path,
        },
        body: {
            worker_incarnation_id: worker,
        },
    });
}

function FlowWorkerDetails({worker}: {worker: string}) {
    const {data, error, isLoading} = useFlowWorkerData(worker);
    return (
        <div className={block()}>
            <FlowWorkerHeader data={data} />
            <FlowWorkerMeta data={data} />
            {isLoading && !data && <Loader visible />}
            {Boolean(error) && <YTErrorBlock error={error} />}
            <FlowMessagesCollapsible messages={data?.messages} marginDirection="bottom" />
            <FlowComputationPartitions partitions={data?.partitions} />
        </div>
    );
}

function FlowWorkerHeader({data}: {data?: FlowWorkerData}) {
    return (
        <Flex className={block('header')} gap={1}>
            <FlowEntityTitle title={i18n('worker')} status={data?.status}>
                {data?.banned && <Label text="Banned" theme="warning" />}
            </FlowEntityTitle>
        </Flex>
    );
}

function FlowWorkerMeta({data}: {data?: FlowWorkerData}) {
    const items = React.useMemo(() => {
        const visible = Boolean(data);
        const res: MetaTableProps['items'] = [
            [
                {key: i18n('address'), value: data?.address, visible},
                {
                    key: i18n('worker-incarnation-id'),
                    value: data?.incarnation_id,
                },
                {
                    key: i18n('worker-groups'),
                    value: data?.groups.join(',') || format.NO_VALUE,
                    visible,
                },
                {
                    key: i18n('deploy-link'),
                    value: <Link>{data?.deploy_address}</Link>,
                    visible,
                },
            ],
            [
                {
                    key: i18n('cpu-usage'),
                    value: format.NumberSmart(data?.cpu_usage),
                    visible,
                },
                {
                    key: i18n('memory-usage'),
                    value: format.Bytes(data?.memory_usage),
                    visible,
                },
                {
                    key: i18n('message-per-second'),
                    value: format.NumberWithSuffix(data?.messages_per_second),
                    visible,
                },
                {
                    key: i18n('bytes-per-second'),
                    value: format.Bytes(data?.bytes_per_second),
                    visible,
                },
            ],
        ];
        return res;
    }, [data]);
    return data ? <MetaTable items={items} /> : null;
}
