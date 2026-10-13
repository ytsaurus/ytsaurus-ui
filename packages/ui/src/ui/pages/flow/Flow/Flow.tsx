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
import {DialogWrapper} from '../../../components/DialogWrapper/DialogWrapper';
import {useUpdater} from '../../../hooks/use-updater';
import format from '../../../common/hammer/format';
import {
    useFlowAttributes,
    useFlowLeaderController,
} from '../../../pages/flow/flow-hooks/use-flow-attributes';
import {loadFlowStatus, updateFlowState} from '../../../store/actions/flow/status';
import {useFlowExecuteQuery} from '../../../store/api/yt/flow';
import {FlowTab} from '../../../store/reducers/flow/filters';
import {type FlowStateAction} from '../../../store/reducers/flow/status';
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
import {FlowPipelineStateTab} from '../flow-components/FlowStateViewer/FlowPipelineStateTab';
import i18nFlowState from '../flow-components/FlowStateViewer/i18n';
import i18n from '../i18n';
import './Flow.scss';
import {FlowComputations} from './FlowComputations/FlowComputations';
import {FlowGraph} from './FlowGraph/FlowGraph';
import {FlowMessages} from './FlowGraph/renderers/FlowGraphRenderer';
import {FlowWorkers} from './FlowWorkers/FlowWorkers';
import {FlowDynamicSpec, FlowStaticSpec} from './PipelineSpec/PipelineSpec';
import {getFlowPathMetaItems} from '../flow-components/FlowMeta/FlowMeta';

const block = cn('yt-flow');

type FlowPipelineExtraTab = {
    value: string;
    title: string;
    component: React.ComponentType<{pipeline_path: string}>;
};

const extraTabs: Array<FlowPipelineExtraTab> = [
    {value: 'state', title: i18nFlowState('mode_state'), component: FlowPipelineStateTab},
];

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

        const props = makeTabProps(`/${cluster}/${Page.FLOWS}`, FlowTab, showSettings);
        const extraItems = extraTabs.map(({value, title}) => ({
            value,
            text: title,
            url: `/${cluster}/${Page.FLOWS}/${value}`,
            show: true,
        }));
        const monitoringIndex = props.items.findIndex(({value}) => value === FlowTab.MONITORING);
        const insertAt = monitoringIndex === -1 ? props.items.length : monitoringIndex + 1;
        const items = [...props.items];
        items.splice(insertAt, 0, ...extraItems);
        return {...props, items};
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
            {extraTabs.map(({value, component: TabComponent}) => (
                <Route
                    key={value}
                    path={`/:cluster/${Page.FLOWS}/${value}`}
                    render={() => <TabComponent pipeline_path={path} />}
                />
            ))}
            <Redirect to={`/:cluster/${Page.FLOWS}/${FlowTab.GRAPH}`} />
        </Switch>
    );
}

const ACTION_POLLING_TIMEOUT = 3000;

export function FlowStatusToolbar() {
    const dispatch = useDispatch();

    const pipeline_path = useSelector(selectFlowPipelinePath);
    const actionInProgress = useSelector(selectFlowActionInProgress);
    const status = useSelector(selectFlowStatusData);

    const updateFn = React.useCallback(() => {
        return dispatch(loadFlowStatus(pipeline_path));
    }, [pipeline_path, dispatch]);

    // Watch the transition closely even if the user turned auto refresh off.
    useUpdater(updateFn, {
        timeout: actionInProgress ? ACTION_POLLING_TIMEOUT : undefined,
        forceAutoRefresh: actionInProgress ? true : undefined,
    });

    const [actionToConfirm, setActionToConfirm] = React.useState<FlowStateAction>();

    React.useEffect(() => {
        if (!actionInProgress) {
            setActionToConfirm(undefined);
        }
    }, [actionInProgress]);

    const {onStart, onStop, onPause, onConfirm} = React.useMemo(() => {
        const sendAction = (action: FlowStateAction) =>
            dispatch(updateFlowState({pipeline_path, state: action}));
        const onAction = (action: FlowStateAction) => {
            // The controller never moves a stopped pipeline to Paused.
            if (action === 'pause' && status === 'Stopped') {
                toaster.add({
                    name: 'flow_pipeline_state',
                    theme: 'warning',
                    title: i18n('cannot-pause'),
                    content: i18n('reason-stopped'),
                });
            } else if (actionInProgress && actionInProgress !== action) {
                setActionToConfirm(action);
            } else {
                sendAction(action);
            }
        };
        return {
            onStart: () => onAction('start'),
            onStop: () => onAction('stop'),
            onPause: () => onAction('pause'),
            onConfirm: (action: FlowStateAction) => {
                setActionToConfirm(undefined);
                sendAction(action);
            },
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
            {actionToConfirm && actionInProgress ? (
                <DialogWrapper open onClose={() => setActionToConfirm(undefined)}>
                    <DialogWrapper.Header caption={i18n('change-state')} />
                    <DialogWrapper.Body>
                        {i18n(`reason-${actionInProgress}`)} {i18n(`confirm-${actionToConfirm}`)}
                    </DialogWrapper.Body>
                    <DialogWrapper.Footer
                        onClickButtonApply={() => onConfirm(actionToConfirm)}
                        onClickButtonCancel={() => setActionToConfirm(undefined)}
                        textButtonApply={i18n(actionToConfirm)}
                        textButtonCancel={i18n('cancel')}
                    />
                </DialogWrapper>
            ) : null}
        </Flex>
    );
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
