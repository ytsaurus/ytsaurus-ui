import {Button, Flex, Link, Spin} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {Redirect, Route, Switch} from 'react-router';
import {Page} from '../../../../shared/constants/settings';
import {formatByParams} from '../../../../shared/utils/format';
import {ClipboardButton, MetaTable} from '@ytsaurus/components';
import Icon, {type IconName} from '../../../components/Icon/Icon';
import StatusLabel from '../../../components/StatusLabel/StatusLabel';
import Tabs from '../../../components/Tabs/Tabs';
import {YTErrorInline} from '../../../containers/YTErrorInline/YTErrorInline';
import {useUpdater} from '../../../hooks/use-updater';
import format from '../../../common/hammer/format';
import {
    useFlowAttributes,
    useFlowLeaderController,
} from '../../../pages/flow/flow-hooks/use-flow-attributes';
import {loadFlowStatus, updateFlowState} from '../../../store/actions/flow/status';
import {useFlowExecuteQuery} from '../../../store/api/yt/flow';
import {FlowTab} from '../../../store/reducers/flow/filters';
import {type FlowStateAction, type FlowStatus} from '../../../store/reducers/flow/status';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectFlowCurrentComputation,
    selectFlowCurrentWorker,
    selectFlowPipelinePath,
} from '../../../store/selectors/flow/filters';
import {
    selectFlowActionInProgress,
    selectFlowStatusData,
} from '../../../store/selectors/flow/status';
import {selectCluster} from '../../../store/selectors/global';
import UIFactory from '../../../UIFactory';
import {makeTabProps} from '../../../utils';
import {toaster} from '../../../utils/toaster';
import {FlowEntityTitle} from '../flow-components/FlowEntityHeader';
import i18n from '../i18n';
import './Flow.scss';
import {FlowComputations} from './FlowComputations/FlowComputations';
import {FlowGraph} from './FlowGraph/FlowGraph';
import {FlowMessages} from './FlowGraph/renderers/FlowGraphRenderer';
import {FlowWorkers} from './FlowWorkers/FlowWorkers';
import {FlowDynamicSpec, FlowStaticSpec} from './PipelineSpec/PipelineSpec';
import {getFlowPathMetaItems} from '../flow-components/FlowMeta/FlowMeta';

const block = cn('yt-flow');

export function Flow() {
    const currentComputation = useSelector(selectFlowCurrentComputation);
    const worker = useSelector(selectFlowCurrentWorker);

    const allowTabs = !worker && !currentComputation;

    return (
        <div className={block()}>
            {allowTabs ? <FlowState /> : null}
            {allowTabs ? <FlowTabs /> : null}
            <div className={block('content')}>
                <FlowContent />
            </div>
        </div>
    );
}

export function FlowTabs() {
    const cluster = useSelector(selectCluster);

    const tabsProps = React.useMemo(() => {
        const {urlTemplate, component} = UIFactory.getMonitoringComponentForNavigationFlow() ?? {};
        const showSettings = {
            [FlowTab.GRAPH]: {title: i18n('graph')},
            [FlowTab.COMPUTATIONS]: {title: i18n('computations')},
            [FlowTab.WORKERS]: {title: i18n('workers')},
            [FlowTab.MONITORING]: {
                show: Boolean(component || urlTemplate),
                title: i18n('monitoring'),
            },
            [FlowTab.STATIC_SPEC]: {title: i18n('static-spec')},
            [FlowTab.DYNAMIC_SPEC]: {title: i18n('dynamic-spec')},
        };

        return makeTabProps(`/${cluster}/${Page.FLOWS}`, FlowTab, showSettings);
    }, [cluster]);

    return <Tabs className={block('tabs')} routed routedPreserveLocation {...tabsProps} />;
}

function FlowContent() {
    const path = useSelector(selectFlowPipelinePath);

    if (!path) {
        return null;
    }

    return (
        <Switch>
            <Route
                path={`/:cluster/${Page.FLOWS}/${FlowTab.GRAPH}`}
                render={() => <FlowGraph pipeline_path={path} />}
            />
            <Route
                path={`/:cluster/${Page.FLOWS}/${FlowTab.COMPUTATIONS}`}
                render={() => <FlowComputations pipeline_path={path} />}
            />
            <Route
                path={`/:cluster/${Page.FLOWS}/${FlowTab.WORKERS}`}
                render={() => <FlowWorkers pipeline_path={path} />}
            />
            <Route
                path={`/:cluster/${Page.FLOWS}/${FlowTab.DYNAMIC_SPEC}`}
                render={() => <FlowDynamicSpec pipeline_path={path} />}
            />
            <Route
                path={`/:cluster/${Page.FLOWS}/${FlowTab.STATIC_SPEC}`}
                render={() => <FlowStaticSpec pipeline_path={path} />}
            />
            <Route
                path={`/:cluster/${Page.FLOWS}/${FlowTab.MONITORING}`}
                render={() => <FlowMonitoring pipeline_path={path} />}
            />
            <Redirect to={`/:cluster/${Page.FLOWS}/${FlowTab.GRAPH}`} />
        </Switch>
    );
}

export function FlowStatusToolbar() {
    const dispatch = useDispatch();

    const pipeline_path = useSelector(selectFlowPipelinePath);
    const actionInProgress = useSelector(selectFlowActionInProgress);
    const status = useSelector(selectFlowStatusData);

    const updateFn = React.useCallback(() => {
        return dispatch(loadFlowStatus(pipeline_path));
    }, [pipeline_path, dispatch]);

    useUpdater(updateFn);

    const {onStart, onStop, onPause} = React.useMemo(() => {
        const onAction = (action: FlowStateAction) => {
            const reason = getBlockedActionReason(action, actionInProgress, status);
            if (reason) {
                toaster.add({
                    name: 'flow_pipeline_state',
                    theme: 'warning',
                    title: i18n(`cannot-${action}`),
                    content: reason,
                });
                return;
            }
            dispatch(updateFlowState({pipeline_path, state: action}));
        };
        return {
            onStart: () => onAction('start'),
            onStop: () => onAction('stop'),
            onPause: () => onAction('pause'),
        };
    }, [dispatch, pipeline_path, actionInProgress, status]);

    return (
        <Flex className={block('status-toolbar')} alignItems="baseline" gap={2}>
            <FlowMessagesLoaded />
            <FlowStateButton
                icon="play-circle"
                title={i18n('start')}
                progressTitle={i18n('starting')}
                inProgress={actionInProgress === 'start'}
                onClick={onStart}
            />
            <FlowStateButton
                icon="pause-circle"
                title={i18n('pause')}
                progressTitle={i18n('pausing')}
                inProgress={actionInProgress === 'pause'}
                onClick={onPause}
            />
            <FlowStateButton
                icon="stop-circle"
                title={i18n('stop')}
                progressTitle={i18n('stopping')}
                inProgress={actionInProgress === 'stop'}
                onClick={onStop}
            />
        </Flex>
    );
}

function getBlockedActionReason(
    action: FlowStateAction,
    actionInProgress: FlowStateAction | undefined,
    status: FlowStatus | undefined,
) {
    if (actionInProgress && actionInProgress !== action) {
        return i18n(`reason-${actionInProgress}`);
    }
    // The controller never moves a stopped pipeline to Paused.
    if (action === 'pause' && status === 'Stopped') {
        return i18n('reason-stopped');
    }
    return undefined;
}

function FlowStateButton({
    icon,
    title,
    progressTitle,
    inProgress,
    onClick,
}: {
    icon: IconName;
    title: string;
    progressTitle: string;
    inProgress: boolean;
    onClick: () => void;
}) {
    return (
        <Button view="outlined" onClick={onClick} disabled={inProgress}>
            {inProgress ? (
                <Spin size="xs" className={block('action-spin')} />
            ) : (
                <Icon awesome={icon} />
            )}{' '}
            {inProgress ? progressTitle : title}
        </Button>
    );
}

function FlowState() {
    const pipeline_path = useSelector(selectFlowPipelinePath);
    const value = useSelector(selectFlowStatusData);
    const {leader_controller_address} = useFlowAttributes(pipeline_path).data ?? {};
    const {
        name: leaderName,
        address: rpcAddress,
        errorContent: leaderError,
    } = useFlowLeaderController(pipeline_path + '/flow_control');
    const leaderAddress =
        (typeof rpcAddress === 'string' && rpcAddress) || leader_controller_address || undefined;
    return (
        <React.Fragment>
            <Flex alignItems="baseline" justifyContent="space-between" gap={2}>
                <FlowEntityTitle title={i18n('pipeline')}>
                    <StatusLabel label={value} />
                </FlowEntityTitle>
                <FlowStatusToolbar />
            </Flex>
            <Flex>
                <MetaTable
                    className={block('meta')}
                    items={[
                        getFlowPathMetaItems(pipeline_path),
                        [
                            {
                                key: 'leader_controller_name',
                                label: i18n('leader-controller-name'),
                                value: leaderError ?? renderCopyableValue(leaderName),
                                className: block('meta-item'),
                            },
                            {
                                key: 'leader_controller_address',
                                label: i18n('leader-controller-address'),
                                value: renderCopyableValue(leaderAddress),
                                className: block('meta-item'),
                            },
                        ],
                    ]}
                />
            </Flex>
        </React.Fragment>
    );
}

function renderCopyableValue(value?: string) {
    return !value ? (
        format.NO_VALUE
    ) : (
        <>
            {value}
            <ClipboardButton view="flat-secondary" text={value} inlineMargins />
        </>
    );
}

export function FlowMessagesLoaded() {
    const pipeline_path = useSelector(selectFlowPipelinePath);

    const cluster = useSelector(selectCluster);
    const {data, error} =
        useFlowExecuteQuery<'describe-pipeline'>({
            cluster,
            parameters: {pipeline_path, flow_command: 'describe-pipeline'},
            body: {status_only: true},
        }) ?? {};

    return error ? (
        <YTErrorInline message={i18n('failed-to-load-messages')} error={error} />
    ) : (
        <FlowMessages data={data?.messages ?? []} paddingTop="none" />
    );
}

function FlowMonitoring({pipeline_path}: {pipeline_path: string}) {
    const {
        component: Component,
        title,
        urlTemplate,
    } = UIFactory.getMonitoringComponentForNavigationFlow() ?? {};
    const attributes = useFlowAttributes(pipeline_path).data;
    const {monitoring_cluster = '', monitoring_project = ''} = attributes ?? {};
    const cluster = useSelector(selectCluster);

    if (Component) {
        return (
            <Component
                cluster={cluster}
                monitoring_cluster={monitoring_cluster}
                monitoring_project={monitoring_project}
                pipeline_path={pipeline_path}
                attributes={attributes}
            />
        );
    } else if (urlTemplate) {
        return (
            <Link
                target="_blank"
                href={formatByParams(urlTemplate, {
                    ytCluster: cluster,
                    monitoring_cluster,
                    monitoring_project,
                })}
            >
                {title || i18n('monitoring')}
            </Link>
        );
    } else {
        return null;
    }
}
