import {Button, Flex, Link} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {Redirect, Route, Switch} from 'react-router';
import {Page} from '../../../../shared/constants/settings';
import {formatByParams} from '../../../../shared/utils/format';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import Icon from '../../../components/Icon/Icon';
import MetaTable from '../../../components/MetaTable/MetaTable';
import StatusLabel from '../../../components/StatusLabel/StatusLabel';
import Tabs from '../../../components/Tabs/Tabs';
import {YTErrorInline} from '../../../containers/YTErrorInline/YTErrorInline';
import {useUpdater} from '../../../hooks/use-updater';
import {useFlowAttributes} from '../../../pages/flow/flow-hooks/use-flow-attributes';
import {loadFlowStatus, updateFlowState} from '../../../store/actions/flow/status';
import {useFlowExecuteQuery} from '../../../store/api/yt/flow';
import {FlowTab} from '../../../store/reducers/flow/filters';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    getFlowCurrentComputation,
    getFlowCurrentWorker,
    getFlowPipelinePath,
} from '../../../store/selectors/flow/filters';
import {getFlowStatusData} from '../../../store/selectors/flow/status';
import {getCluster} from '../../../store/selectors/global';
import UIFactory from '../../../UIFactory';
import {makeTabProps} from '../../../utils';
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
    const currentComputation = useSelector(getFlowCurrentComputation);
    const worker = useSelector(getFlowCurrentWorker);

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
    const cluster = useSelector(getCluster);

    const tabsProps = React.useMemo(() => {
        const {urlTemplate, component} = UIFactory.getMonitoringComponentForNavigationFlow() ?? {};
        const showSettings = {
            [FlowTab.MONITORING]: {show: Boolean(component || urlTemplate)},
        };

        return makeTabProps(`/${cluster}/${Page.FLOWS}`, FlowTab, showSettings);
    }, [cluster]);

    return <Tabs className={block('tabs')} routed routedPreserveLocation {...tabsProps} />;
}

function FlowContent() {
    const path = useSelector(getFlowPipelinePath);

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

function FlowStatusToolbar() {
    const dispatch = useDispatch();

    const pipeline_path = useSelector(getFlowPipelinePath);

    const updateFn = React.useCallback(() => {
        return dispatch(loadFlowStatus(pipeline_path));
    }, [pipeline_path, dispatch]);

    useUpdater(updateFn);

    const {onStart, onStop, onPause} = React.useMemo(() => {
        return {
            onStart: () => dispatch(updateFlowState({pipeline_path, state: 'start'})),
            onStop: () => dispatch(updateFlowState({pipeline_path, state: 'stop'})),
            onPause: () => dispatch(updateFlowState({pipeline_path, state: 'pause'})),
        };
    }, [dispatch, pipeline_path]);

    return (
        <Flex className={block('status-toolbar')} alignItems="baseline" gap={2}>
            <FlowMessagesLoaded />
            <Button view="outlined" onClick={onStart}>
                <Icon awesome="play-circle" /> Start
            </Button>
            <Button view="outlined" onClick={onPause}>
                <Icon awesome="pause-circle" /> Pause
            </Button>
            <Button view="outlined" onClick={onStop}>
                <Icon awesome="stop-circle" /> Stop
            </Button>
        </Flex>
    );
}

function FlowState() {
    const pipeline_path = useSelector(getFlowPipelinePath);
    const value = useSelector(getFlowStatusData);
    const {leader_controller_address} = useFlowAttributes(pipeline_path).data ?? {};
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
                                key: 'leader_controller_address',
                                label: i18n('leader-controller-address'),
                                value: (
                                    <>
                                        {leader_controller_address}
                                        <ClipboardButton
                                            view="flat-secondary"
                                            text={leader_controller_address}
                                            inlineMargins
                                        />
                                    </>
                                ),
                                className: block('meta-item'),
                            },
                        ],
                    ]}
                />
            </Flex>
        </React.Fragment>
    );
}

export function FlowMessagesLoaded() {
    const pipeline_path = useSelector(getFlowPipelinePath);

    const cluster = useSelector(getCluster);
    const {data, error} =
        useFlowExecuteQuery<'describe-pipeline'>({
            cluster,
            parameters: {pipeline_path, flow_command: 'describe-pipeline'},
            body: {status_only: true},
        }) ?? {};

    return error ? (
        <YTErrorInline message="Failded to load messages" error={error} />
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
    const cluster = useSelector(getCluster);

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
                {title || 'Monitoring'}
            </Link>
        );
    } else {
        return null;
    }
}
