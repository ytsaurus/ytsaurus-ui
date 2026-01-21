import {Button, Flex} from '@gravity-ui/uikit';
import axios from 'axios';
import cn from 'bem-cn-lite';
import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router';
import {Page} from '../../../../../shared/constants/settings';
import {FlowWorkerData} from '../../../../../shared/yt-types';
import format from '../../../../common/hammer/format';
import Label from '../../../../components/Label/Label';
import Link from '../../../../components/Link/Link';
import Loader from '../../../../components/Loader/Loader';
import MetaTable, {MetaTableProps, TemplateId} from '../../../../components/MetaTable/MetaTable';
import Tabs from '../../../../components/Tabs/Tabs';
import {FlowEntityTitle} from '../../../../pages/flow/flow-components/FlowEntityHeader';
import {FlowError} from '../../../../pages/flow/flow-components/FlowError/FlowError';
import {FlowMessagesCollapsible} from '../../../../pages/flow/flow-components/FlowMessagesCollapsible/FlowMessagesCollapsible';
import {
    getFlowPathMetaItems,
    getLoadedDataMetaItems,
} from '../../../../pages/flow/flow-components/FlowMeta/FlowMeta';
import {FlowComputationPartitions} from '../../../../pages/flow/Flow/FlowComputation/FlowComputationPartitions';
import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';
import {useFlowExecuteQuery} from '../../../../store/api/yt/flow';
import {filtersSlice} from '../../../../store/reducers/flow/filters';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import {getCluster} from '../../../../store/selectors/global/cluster';
import UIFactory from '../../../../UIFactory';
import {openInNewTab, wrapApiPromiseByToaster} from '../../../../utils/utils';
import './FlowWorker.scss';
import i18n from './i18n';

const block = cn('yt-flow-worker');

export function FlowWorker() {
    const dispatch = useDispatch();

    const {
        path,
        params: {worker: workerRaw},
    } = useRouteMatch<{worker: string}>();

    const worker = decodeURIComponent(workerRaw);

    React.useEffect(() => {
        dispatch(filtersSlice.actions.updateFlowFilters({currentWorker: worker}));
        return () => {
            dispatch(filtersSlice.actions.updateFlowFilters({currentWorker: ''}));
        };
    }, [worker, dispatch]);

    const monitorComponent = UIFactory.getMonitoringComponentForFlowWorker();

    return (
        <div className={block()}>
            <Switch>
                <Route
                    path={`${path}/details`}
                    render={() => <FlowWorkerDetails worker={worker} />}
                />
                {Boolean(monitorComponent) && (
                    <Route
                        path={`${path}/monitor`}
                        render={() => <FlowWorkderMonitor worker={worker} />}
                    />
                )}
            </Switch>
        </div>
    );
}

function useFlowWorkerData(worker: string) {
    const pipeline_path = useSelector(getFlowPipelinePath);
    return useFlowExecuteQuery<'describe-worker'>({
        parameters: {
            flow_command: 'describe-worker',
            pipeline_path,
        },
        body: {
            worker,
        },
    });
}

function FlowWorkerDetails({worker}: {worker: string}) {
    const {data, error, isLoading} = useFlowWorkerData(worker);
    return (
        <>
            <FlowWorkerHeader data={data} loading={!data && isLoading} />
            <FlowWorkderTabs worker={worker} />
            <FlowWorkerMeta data={data} />
            {isLoading && !data && <Loader visible />}
            {Boolean(error) && <FlowError error={error} />}
            <FlowMessagesCollapsible messages={data?.messages} marginDirection="bottom" />
            <FlowComputationPartitions partitions={data?.partitions} />
        </>
    );
}

function FlowWorkderMonitor({worker}: {worker: string}) {
    const path = useSelector(getFlowPipelinePath);
    const {data, error, isLoading} = useFlowWorkerData(worker);

    const MonitorComponent = UIFactory.getMonitoringComponentForFlowWorker();
    if (!MonitorComponent) {
        return null;
    }

    return (
        <>
            <FlowWorkerHeader data={data} loading={!data && isLoading} />
            {isLoading && !data && <Loader visible />}
            {Boolean(error) && <FlowError error={error} />}
            <FlowWorkderTabs worker={worker} />
            {data ? <MonitorComponent path={path} data={data} /> : null}
        </>
    );
}

function FlowWorkderTabs({worker}: {worker: string}) {
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
                    url: `/${cluster}/${Page.FLOWS}/workers/${encodeURIComponent(worker)}/details`,
                    routed: true,
                    show: true,
                },
                {
                    value: 'monitor',
                    text: i18n('monitoring'),
                    url: `/${cluster}/${Page.FLOWS}/workers/${encodeURIComponent(worker)}/monitor`,
                    show: true,
                },
            ]}
        />
    );
}

function FlowWorkerHeader({data, loading}: {data?: FlowWorkerData; loading?: boolean}) {
    return (
        <Flex className={block('header')} gap={1} justifyContent="space-between">
            <FlowEntityTitle title={i18n('worker')} status={data?.status} loading={loading}>
                {data?.banned && <Label text="Banned" theme="warning" />}
            </FlowEntityTitle>
            <FlowWorkerActions data={data} />
        </Flex>
    );
}

function FlowWorkerActions({data}: {data?: FlowWorkerData}) {
    const pipeline_path = useSelector(getFlowPipelinePath);
    if (!data) {
        return null;
    }
    return (
        <Flex gap={2}>
            <FlowWorkerBanAction data={data} pipeline_path={pipeline_path} />
            <FlowWorkerFlamegraphAction data={data} />
            <FlowWorkerKillAction data={data} pipeline_path={pipeline_path} />
        </Flex>
    );
}

function FlowWorkerBanAction({
    data: {address: worker, banned},
    pipeline_path,
}: {
    data: FlowWorkerData;
    pipeline_path: string;
}) {
    const [loading, setLoading] = React.useState(false);

    return (
        <Button
            loading={loading}
            onClick={async () => {
                try {
                    setLoading(true);
                    await wrapApiPromiseByToaster(
                        ytApiV4Id.flowExecute(YTApiId.flowExecute, {
                            parameters: {flow_command: 'update-worker', pipeline_path},
                            data: {worker},
                        }),
                        {
                            toasterName: 'update_worker',
                            skipSuccessToast: true,
                            errorContent: i18n('action_failed-to-update'),
                        },
                    );
                } finally {
                    setLoading(false);
                }
            }}
        >
            {banned ? i18n('action_ban') : i18n('action_unban')}
        </Button>
    );
}

function FlowWorkerFlamegraphAction({data: {flamegraph_address}}: {data: FlowWorkerData}) {
    const [loading, setLoading] = React.useState(false);

    if (!flamegraph_address) {
        return null;
    }

    return (
        <Button
            loading={loading}
            onClick={async () => {
                try {
                    setLoading(true);
                    const {
                        data: {link},
                    } = await wrapApiPromiseByToaster(
                        axios.get<{link: string}>(flamegraph_address),
                        {
                            toasterName: 'worker-flamegraph',
                            skipSuccessToast: true,
                            errorContent: i18n('action_failed-to-get-flamegraph'),
                        },
                    );
                    if (link) {
                        openInNewTab(link);
                    }
                } finally {
                    setLoading(false);
                }
            }}
        >
            {i18n('action_flamegraph')}
        </Button>
    );
}

function FlowWorkerKillAction({
    data: {address: worker},
    pipeline_path,
}: {
    data: FlowWorkerData;
    pipeline_path: string;
}) {
    const [loading, setLoading] = React.useState(false);

    return (
        <Button
            loading={loading}
            onClick={async () => {
                try {
                    setLoading(true);
                    await wrapApiPromiseByToaster(
                        ytApiV4Id.flowExecute(YTApiId.flowExecute, {
                            parameters: {flow_command: 'kill-worker', pipeline_path},
                            data: {worker},
                        }),
                        {
                            toasterName: 'kill-worker',
                        },
                    );
                } finally {
                    setLoading(false);
                }
            }}
        >
            {i18n('action_kill')}
        </Button>
    );
}

function FlowWorkerMeta({data}: {data?: FlowWorkerData}) {
    const path = useSelector(getFlowPipelinePath);
    const items = React.useMemo(() => {
        const visible = Boolean(data);
        const res: MetaTableProps['items'] = [
            [
                ...getFlowPathMetaItems(path),
                {key: i18n('address'), value: data?.address, visible},
                {
                    key: i18n('worker-incarnation-id'),
                    value: <TemplateId id={data?.incarnation_id} />,
                },
                {
                    key: i18n('worker-groups'),
                    value: data?.groups.join(',') || format.NO_VALUE,
                    visible,
                },
                {
                    key: i18n('deploy-link'),
                    value: (
                        <Link url={data?.deploy_address} hasExternalIcon>
                            {i18n('link')}
                        </Link>
                    ),
                    visible: visible && Boolean(data?.deploy_address),
                },
                {
                    key: i18n('backtraces'),
                    value: (
                        <Link url={data?.backtrace_address} hasExternalIcon>
                            {i18n('link')}
                        </Link>
                    ),
                    visible: visible && Boolean(data?.backtrace_address),
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
            getLoadedDataMetaItems({label: i18n('worker-data'), data}),
        ];
        return res;
    }, [data]);
    return data ? <MetaTable items={items} /> : null;
}
