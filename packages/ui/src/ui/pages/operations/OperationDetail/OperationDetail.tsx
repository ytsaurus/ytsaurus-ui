import {match as MatchType, Redirect, Route, Switch} from 'react-router';
import React, {Fragment} from 'react';
import {ConnectedProps, connect, useDispatch, useSelector} from 'react-redux';
import hammer from '../../../common/hammer';
import unipika from '../../../common/thor/unipika';
import cn from 'bem-cn-lite';

import ypath from '../../../common/thor/ypath';

import MetaTable, {Template, TemplatePools} from '../../../components/MetaTable/MetaTable';
import OperationProgress from '../OperationProgress/OperationProgress';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import {SubjectCard} from '../../../components/SubjectLink/SubjectLink';
import Button from '../../../components/Button/Button';
import {Loader} from '@gravity-ui/uikit';
import {YTErrorBlock} from '../../../components/Error/Error';
import Icon from '../../../components/Icon/Icon';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import Tabs from '../../../components/Tabs/Tabs';
import Yson from '../../../components/Yson/Yson';
import StatusLabel from '../../../components/StatusLabel/StatusLabel';

import PartitionSizes from './tabs/partition-sizes/PartitionSizes/PartitionSizes';
import Details from './tabs/details/Details/Details';
import Specification from './tabs/specification/Specification';
import JobSizes from './tabs/job-sizes/JobSizes/JobSizes';
import Statistics from './tabs/statistics/Statistics';
import Jobs from './tabs/Jobs/Jobs';
import JobsMonitor from './tabs/JobsMonitor/JobsMonitor';
import OperationAttributes from './tabs/attributes/OperationAttributes';

import Placeholder from '../../../pages/components/Placeholder';

import {
    getDetailsTabsShowSettings,
    operationMonitoringUrl,
    performAction,
} from '../../../utils/operations/detail';
import {DEFAULT_TAB, OperationTabType, Tab} from '../../../constants/operations/detail';
import {showEditPoolsWeightsModal} from '../../../store/actions/operations';
import {getOperation} from '../../../store/actions/operations/detail';
import {isOperationId} from '../../../utils/operations/list';
import {promptAction} from '../../../store/actions/actions';
import {useUpdater} from '../../../hooks/use-updater';
import {TabSettings, makeTabProps} from '../../../utils';
import {Page} from '../../../constants/index';
import {
    getOperationDetailsLoadingStatus,
    getOperationErasedTrees,
    getOperationPerformanceUrlTemplate,
    selectIsOperationInGpuTree,
} from '../../../store/selectors/operations/operation';

import {useAppRumMeasureStart} from '../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../utils/utils';

import './OperationDetail.scss';
import {updateListJobsFilter} from '../../../store/actions/operations/jobs';
import OperationDetailsMonitor from './tabs/monitor/OperationDetailsMonitor';
import {getJobsMonitorTabVisible} from '../../../store/selectors/operations/jobs-monitor';
import {RuntimeItem} from '../../../store/reducers/operations/detail';
import {
    JobState,
    getOperationStatiscsHasData,
    getTotalCpuTimeSpent,
    getTotalJobWallTime,
} from '../../../store/selectors/operations/statistics-v2';
import UIFactory from '../../../UIFactory';
import {RootState} from '../../../store/reducers';
import {getCurrentCluster} from '../../../store/selectors/thor';
import {UI_TAB_SIZE} from '../../../constants/global';
import {OperationPool, OperationStates} from '../selectors';
import {JobsTimeline} from './tabs/JobsTimeline';
import {getOperationEvents, listOperationEventsApi} from '../../../store/api/yt';
import {getYsonSettingsDisableDecode} from '../../../store/selectors/thor/unipika';

const detailBlock = cn('operation-detail');

const headingBlock = cn('elements-heading');

type RouteProps = {match: MatchType<{operationId: string; tab: OperationTabType}>};

type ReduxProps = ConnectedProps<typeof connector>;

function OperationDetailUpdater({operationId}: {operationId: string}) {
    const dispatch = useDispatch();

    const updateFn = React.useCallback(() => {
        dispatch(getOperation(operationId));
    }, [dispatch, operationId]);

    useUpdater(updateFn, {timeout: 15 * 1000});

    return null;
}

function getSpecialWaitingStatuses(
    pools: OperationPool[],
    state: OperationStates,
    suspended: boolean | undefined,
    runtime: RuntimeItem[] | undefined,
    type: string | undefined,
    isGpuOperation: boolean | undefined,
) {
    const fairShareRatio = runtime?.[0]?.progress?.fair_share_ratio as number | undefined;
    const usageRatio = runtime?.[0]?.progress?.usage_ratio as number | undefined;
    const demandRatio = runtime?.[0]?.progress?.demand_ratio as number | undefined;

    const isSingleTree = new Set(pools?.map((pool) => pool?.tree)).size === 1;
    const isSpecialStatus =
        type === 'vanilla' && isSingleTree && state === 'running' && isGpuOperation && !suspended;

    const isWaitingForResources =
        isSpecialStatus && fairShareRatio === usageRatio && fairShareRatio === 0;

    const isWaitingForJobs =
        isSpecialStatus &&
        fairShareRatio === demandRatio &&
        usageRatio !== undefined &&
        fairShareRatio !== undefined &&
        usageRatio < fairShareRatio;

    return {isWaitingForResources, isWaitingForJobs};
}

const waitingForJobsTooltip =
    'Operation scheduling has started, but not all jobs have been scheduled yet. If the problem persists, contact cluster administrators.';
const waitingForResourcesTooltip =
    'Not enough resources to start operation scheduling. This may happen if the pool has too many operations in the queue or too low resource guarantees.';

function SpecialWaitingStatus({type}: {type: 'jobs' | 'resources'}) {
    return (
        <Tooltip content={type === 'jobs' ? waitingForJobsTooltip : waitingForResourcesTooltip}>
            <StatusLabel
                state={'running'}
                iconState={'running'}
                text={`Waiting for ${type}`}
                renderPlaque
            />
        </Tooltip>
    );
}

class OperationDetail extends React.Component<ReduxProps & RouteProps> {
    get settings() {
        return unipika.prepareSettings();
    }

    componentDidMount() {
        const {operationId} = this.props.match.params;
        this.props.listOperationEvents(operationId);
    }

    handlePoolsEditClick = () => {
        const {operation, showEditPoolsWeightsModal} = this.props;
        showEditPoolsWeightsModal(operation);
    };

    renderAction = (action: ReduxProps['actions'][0]) => {
        const {promptAction, operation} = this.props;

        const message = action.message || (
            <span>
                Are you sure you want to <strong>{action.name}</strong> the operation?
            </span>
        );
        const handler = ({currentOption}: {currentOption?: string}) =>
            performAction({
                ...action,
                operation,
                currentOption,
            }).then(() => {
                return this.props.getOperation(operation.$value);
            });

        return (
            <Button
                key={action.name}
                view={action.theme}
                className={detailBlock('action')}
                title={hammer.format['ReadableField'](action.name)}
                onClick={() => promptAction({...action, message, handler})}
            >
                <Icon awesome={action.icon} />
                &nbsp;
                {hammer.format['ReadableField'](action.name)}
            </Button>
        );
    };

    renderHeader() {
        const {actions = [], runtime, operation, isGpuOperation} = this.props;
        const {type, user = '', state, suspended, pools, title, $value} = operation;

        const {isWaitingForJobs, isWaitingForResources} = getSpecialWaitingStatuses(
            pools,
            state,
            suspended,
            runtime,
            type,
            isGpuOperation,
        );

        const label = suspended ? 'suspended' : state;

        const mainStatusProps:
            | {label: typeof label}
            | {state: 'unknown'; iconState: 'running'; text: string} =
            isWaitingForJobs || isWaitingForResources
                ? {state: 'unknown', iconState: 'running', text: 'Running'}
                : {label: suspended ? 'suspended' : state};

        return (
            <div className={detailBlock('header', 'elements-section')}>
                <div className={detailBlock('header-heading', headingBlock({size: 'l'}))}>
                    {hammer.format['ReadableField'](type)} operation by <SubjectCard name={user} />
                    &ensp;
                    <StatusLabel {...mainStatusProps} renderPlaque />
                    &ensp;
                    {isWaitingForJobs && <SpecialWaitingStatus type={'jobs'} />}
                    {isWaitingForResources && <SpecialWaitingStatus type={'resources'} />}
                </div>
                <div className={detailBlock('header-title')}>
                    <Yson value={title || $value} settings={this.props.ysonSettings} inline />
                </div>

                <div className={detailBlock('actions')}>{actions.map(this.renderAction)}</div>
            </div>
        );
    }

    renderOverview() {
        const {operation, cluster, totalJobWallTime, cpuTimeSpent, erasedTrees, isGpuOperation} =
            this.props;
        const {$value, user = '', type, startTime, finishTime, duration, pools, state} = operation;

        const isGpuVanillaOperation = isGpuOperation && type === 'vanilla';

        const items = [
            [
                {key: 'id', value: <Template.Id id={$value} />},
                {key: 'user', value: <SubjectCard name={user} />},
                {
                    key: 'pools',
                    value: (
                        <TemplatePools
                            onEdit={this.handlePoolsEditClick}
                            cluster={cluster}
                            pools={pools}
                            operationRefId={$value}
                            state={state}
                            erasedTrees={erasedTrees}
                            editBtnVisibility="always"
                        />
                    ),
                },
                {key: 'type', value: <Template.Readable value={type} />},
            ],
            [
                {
                    key: 'started',
                    value: <Template.Time time={startTime} valueFormat="DateTime" />,
                },
                {
                    key: 'finished',
                    value: <Template.Time time={finishTime} valueFormat="DateTime" />,
                },
                {
                    key: 'duration',
                    value: <Template.Time time={duration} valueFormat="TimeDuration" />,
                },
                {
                    key: 'total job wall time',
                    value: <Template.Time time={totalJobWallTime} valueFormat="TimeDuration" />,
                    visible: !isGpuVanillaOperation,
                },
                {
                    key: 'total cpu time spent',
                    value: <Template.Time time={cpuTimeSpent} valueFormat="TimeDuration" />,
                    visible: !isGpuVanillaOperation,
                },
            ],
        ];

        return (
            <div className={detailBlock('overview')}>
                <div className={detailBlock('general')}>
                    <MetaTable items={items} />
                </div>

                <div className={detailBlock('progress-wrapper')}>
                    <OperationProgress
                        operation={operation}
                        onLinkClick={this.onProgressLinkClick}
                    />
                    {operation.state !== 'failed' && (
                        <OperationProgress
                            operation={operation}
                            type="failed"
                            onLinkClick={this.onProgressLinkClick}
                        />
                    )}
                </div>
            </div>
        );
    }

    onProgressLinkClick = (jobState: JobState) => {
        const {updateListJobsFilter} = this.props;
        updateListJobsFilter({name: 'state', value: jobState});
    };

    renderTabs() {
        const {
            match: {
                params: {operationId, tab: activeTab},
            },
            cluster,
            operation,
            hasStatististicsTab,
            jobsMonitorVisible,
            monitorTabVisible,
            monitorTabTitle,
            monitorTabUrlTemplate,
            timelineTabVisible,
            operationPerformanceUrlTemplate,
            operationEvents,
        } = this.props;
        const path = `/${cluster}/${Page.OPERATIONS}/${operationId}`;

        const showSettings: Record<string, TabSettings> = {
            ...getDetailsTabsShowSettings(operation),
            [Tab.STATISTICS]: {show: hasStatististicsTab},
            [Tab.JOBS_MONITOR]: {show: jobsMonitorVisible || activeTab === Tab.JOBS_MONITOR},
            [Tab.MONITOR]: {show: monitorTabVisible},
            [Tab.JOBS_TIMELINE]: {show: timelineTabVisible},
            [Tab.INCARNATIONS]: {show: Boolean(operationEvents?.length)},
            [Tab.LOGS]: {show: Boolean(UIFactory.renderOperationLogsTab())},
            [Tab.PERFORMANCE]: {
                show: Boolean(operationPerformanceUrlTemplate),
                external: true,
                url: operationPerformanceUrlTemplate?.url,
                title: operationPerformanceUrlTemplate?.title,
                routed: false,
            },
        };

        if (monitorTabUrlTemplate) {
            const monTab = showSettings[Tab.MONITOR];
            monTab.routed = false;
            monTab.external = true;

            const firstPoolInfo = operation.pools?.[0] || {};
            monTab.url = operationMonitoringUrl({
                cluster,
                operation,
                ...firstPoolInfo,
                urlTemplate: monitorTabUrlTemplate,
            });
        }

        const props = makeTabProps(path, Tab, showSettings, undefined, {
            [Tab.MONITOR]: monitorTabTitle ?? 'Monitoring',
        });

        return (
            <div className={detailBlock('tabs')}>
                <Tabs
                    {...props}
                    active={activeTab}
                    routed
                    routedPreserveLocation
                    size={UI_TAB_SIZE}
                />
            </div>
        );
    }

    renderMain() {
        const {
            match,
            cluster,
            monitorTabVisible,
            jobsMonitorIsSupported,
            monitoringComponent,
            timelineTabVisible,
        } = this.props;
        const {url, params} = match;
        const {operationId} = params;

        const path = `/${cluster}/${Page.OPERATIONS}/${operationId}`;

        // NOTE: <Redirect> has issues with urls which contain '*', and since every operation alias starts with it,
        // we have to redirect to real operation id in those cases
        return !isOperationId(operationId) ? (
            this.renderAlias()
        ) : (
            <div className={detailBlock('main')}>
                <Switch>
                    <Route
                        path={`${path}/${Tab.ATTRIBUTES}`}
                        render={() => <OperationAttributes className={detailBlock('attributes')} />}
                    />
                    <Route path={`${path}/${Tab.DETAILS}`} component={Details} />
                    <Route path={`${path}/${Tab.SPECIFICATION}`} component={Specification} />
                    <Route
                        path={`${path}/${Tab.STATISTICS}`}
                        render={() => <Statistics className={detailBlock('statistics')} />}
                    />
                    <Route
                        path={`${path}/${Tab.JOBS}`}
                        render={() => <Jobs className={detailBlock('jobs')} />}
                    />
                    {timelineTabVisible && (
                        <Route
                            path={`${path}/${Tab.JOBS_TIMELINE}`}
                            render={() => <JobsTimeline />}
                        />
                    )}
                    <Route
                        path={`${path}/${Tab.JOB_SIZES}`}
                        render={() => <JobSizes className={detailBlock('job-sizes')} />}
                    />
                    <Route path={`${path}/${Tab.PARTITION_SIZES}`} component={PartitionSizes} />
                    {monitorTabVisible && monitoringComponent && (
                        <Route
                            path={`${path}/${Tab.MONITOR}`}
                            render={() => (
                                <OperationDetailsMonitor component={monitoringComponent} />
                            )}
                        />
                    )}
                    {jobsMonitorIsSupported && (
                        <Route path={`${path}/${Tab.JOBS_MONITOR}`} component={JobsMonitor} />
                    )}
                    <Route
                        path={`${path}/${Tab.INCARNATIONS}`}
                        render={UIFactory.renderIncarnationsTab}
                    />
                    <Route path={`${path}/${Tab.LOGS}`} render={UIFactory.renderOperationLogsTab} />
                    <Route path={`${path}/:tab`} component={Placeholder} />
                    <Redirect from={url} to={`${path}/${DEFAULT_TAB}`} />
                </Switch>
            </div>
        );
    }

    renderAlias() {
        const {match, cluster, operation} = this.props;
        const {
            url,
            params: {operationId, tab},
        } = match;

        const alias = ypath.getValue(operation, '/@spec/alias');
        if (operationId !== alias) {
            // Just wait until operation data is loaded
            return null;
        }

        const redirectPath = `/${cluster}/${Page.OPERATIONS}/${operation.$value}${
            tab ? '/' + tab : ''
        }`;
        return <Redirect from={url} to={redirectPath} />;
    }

    renderContent(isFirstLoading: boolean) {
        return isFirstLoading ? (
            <Loader />
        ) : (
            <Fragment>
                {this.renderHeader()}
                {this.renderOverview()}
                {this.renderTabs()}
                {this.renderMain()}
            </Fragment>
        );
    }

    renderError() {
        const {errorData} = this.props;

        return <YTErrorBlock message={errorData.message} error={errorData.details} />;
    }

    render() {
        const {
            error,
            loading,
            loaded,
            match: {
                params: {operationId},
            },
        } = this.props;
        const isFirstLoading = loading && !loaded;

        return (
            <ErrorBoundary>
                <OperationDetailUpdater operationId={operationId} />
                <div className={detailBlock({loading: isFirstLoading})}>
                    {error && !loaded ? this.renderError() : this.renderContent(isFirstLoading)}
                </div>
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state: RootState, routerProps: RouteProps) => {
    const {operation, errorData, loading, loaded, error, actions, details} =
        state.operations.detail;
    const totalJobWallTime = getTotalJobWallTime(state);
    const cpuTimeSpent = getTotalCpuTimeSpent(state);
    const erasedTrees = getOperationErasedTrees(state);
    const {runtime} = details;

    const {operationId} = routerProps.match.params;
    const {data: operationEvents} = getOperationEvents(state, {
        operation_id: operationId,
        event_type: 'incarnation_started',
    });

    const {
        component: monitoringComponent,
        urlTemplate: monitorTabUrlTemplate,
        title: monitorTabTitle,
    } = UIFactory.getMonitoringForOperation(operation) || {};

    const monitorTabVisible = Boolean(monitoringComponent) || Boolean(monitorTabUrlTemplate);

    return {
        cluster: getCurrentCluster(state),
        operation,
        errorData,
        loading,
        loaded,
        error,
        actions,
        runtime,
        totalJobWallTime,
        cpuTimeSpent,
        erasedTrees,
        monitorTabVisible,
        monitorTabTitle,
        monitorTabUrlTemplate,
        monitoringComponent,
        timelineTabVisible: operation?.type === 'vanilla',
        jobsMonitorIsSupported: Boolean(UIFactory.getMonitorComponentForJob()),
        jobsMonitorVisible: getJobsMonitorTabVisible(state),
        hasStatististicsTab: getOperationStatiscsHasData(state),
        isGpuOperation: selectIsOperationInGpuTree(state),
        operationPerformanceUrlTemplate: getOperationPerformanceUrlTemplate(state),
        operationEvents,
        ysonSettings: getYsonSettingsDisableDecode(state),
    };
};

const mapDispatchToProps = {
    promptAction,
    getOperation,
    showEditPoolsWeightsModal,
    updateListJobsFilter,
    listOperationEvents: (operationId: string) =>
        listOperationEventsApi.endpoints.listOperationEvents.initiate({
            operation_id: operationId,
            event_type: 'incarnation_started',
        }),
};

const connector = connect(mapStateToProps, mapDispatchToProps);

const OperationDetailConnected = connector(OperationDetail);

export default function OperationDetailsWithRum(props: RouteProps) {
    const loadState = useSelector(getOperationDetailsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.OPERATION,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    return <OperationDetailConnected {...props} />;
}
