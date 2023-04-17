import {Route, Switch, Redirect, match as MatchType} from 'react-router';
import React, {Fragment} from 'react';
import {ConnectedProps, connect, useSelector} from 'react-redux';
//import PropTypes from 'prop-types';
import hammer from '../../../common/hammer';
import unipika from '../../../common/thor/unipika';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import ypath from '../../../common/thor/ypath';

import MetaTable, {Template, OperationTemplate} from '../../../components/MetaTable/MetaTable';
import OperationProgress from '../OperationProgress/OperationProgress';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import {UserCard} from '../../../components/UserLink/UserLink';
import StatusLabel from '../../../components/StatusLabel/StatusLabel';
import Button from '../../../components/Button/Button';
import {Loader} from '@gravity-ui/uikit';
import Error from '../../../components/Error/Error';
import Icon from '../../../components/Icon/Icon';
import Tabs from '../../../components/Tabs/Tabs';
import Yson from '../../../components/Yson/Yson';

import PartitionSizes from './tabs/partition-sizes/PartitionSizes/PartitionSizes';
import Details from './tabs/details/Details/Details';
import Specification from './tabs/specification/Specification';
import JobSizes from './tabs/job-sizes/JobSizes/JobSizes';
import Statistics from './tabs/statistics/Statistics';
import Jobs from './tabs/Jobs/Jobs';
import JobsMonitor from './tabs/JobsMonitor/JobsMonitor';
import OperationAttributes from './tabs/attributes/OperationAttributes';

import Placeholder from '../../../pages/components/Placeholder';

import {performAction, getDetailsTabsShowSettings} from '../../../utils/operations/detail';
import {
    Tab,
    DEFAULT_TAB,
    POLLING_INTERVAL,
    OperationTabType,
} from '../../../constants/operations/detail';
import {
    getTotalCpuTimeSpent,
    getTotalJobWallTime,
} from '../../../store/selectors/operations/statistics';
import {showEditPoolsWeightsModal} from '../../../store/actions/operations';
import {getOperation} from '../../../store/actions/operations/detail';
import {isOperationId} from '../../../utils/operations/list';
import {promptAction} from '../../../store/actions/actions';
import Updater from '../../../utils/hammer/updater';
import {makeTabProps} from '../../../utils';
import {Page} from '../../../constants/index';
import {
    getOperationErasedTrees,
    getOperationDetailsLoadingStatus,
} from '../../../store/selectors/operations/operation';

import {useAppRumMeasureStart} from '../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../utils/utils';

import './OperationDetail.scss';
import {updateFilter} from '../../../store/actions/operations/jobs';
import {getUISizes} from '../../../store/selectors/global';
import OperationDetailsMonitor from './tabs/monitor/OperationDetailsMonitor';
import {getJobsMonitorTabVisible} from '../../../store/selectors/operations/jobs-monitor';
import {
    getOperationStatiscsHasData,
    JobState,
} from '../../../store/selectors/operations/statistics-v2';
import UIFactory from '../../../UIFactory';
import {RootState} from '../../../store/reducers';
import {getCurrentCluster} from '../../../store/selectors/thor';

const detailBlock = cn('operation-detail');

const headingBlock = cn('elements-heading');
const updater = new Updater();

type RouteProps = {match: MatchType<{operationId: string; tab: OperationTabType}>};

type ReduxProps = ConnectedProps<typeof connector>;

class OperationDetail extends React.Component<ReduxProps & RouteProps> {
    componentDidMount() {
        const {
            getOperation,
            match: {
                params: {operationId},
            },
        } = this.props;

        updater.add('operation.detail', () => getOperation(operationId), POLLING_INTERVAL);
    }

    componentWillUnmount() {
        updater.remove('operation.detail');
    }

    get settings() {
        return unipika.prepareSettings();
    }

    handlePoolsEditClick = () => {
        const {operation, showEditPoolsWeightsModal} = this.props;
        showEditPoolsWeightsModal(operation);
    };

    renderAction = (action: ReduxProps['actions'][0]) => {
        const {promptAction, operation, getOperation} = this.props;

        const updateOperation = () => getOperation(operation.$value);
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
                updateOperation,
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
        const {actions} = this.props;
        const {type, user = '', state, suspended, title, $value} = this.props.operation;
        const label = suspended ? 'suspended' : state;

        return (
            <div className={detailBlock('header', 'elements-section')}>
                <div className={detailBlock('header-heading', headingBlock({size: 'l'}))}>
                    {hammer.format['ReadableField'](type)} operation by <UserCard userName={user} />
                    &ensp;
                    <StatusLabel label={label} renderPlaque />
                </div>

                <div className={detailBlock('header-title')}>
                    <Yson value={title || $value} inline />
                </div>

                <div className={detailBlock('actions')}>{_.map(actions, this.renderAction)}</div>
            </div>
        );
    }

    renderOverview() {
        const {operation, cluster, totalJobWallTime, cpuTimeSpent, erasedTrees} = this.props;
        const {$value, user = '', type, startTime, finishTime, duration, pools, state} = operation;

        const items = [
            [
                {key: 'id', value: <Template.Id id={$value} />},
                {key: 'user', value: <UserCard userName={user} />},
                {
                    key: 'pools',
                    value: (
                        <OperationTemplate.Pools
                            onEdit={this.handlePoolsEditClick}
                            cluster={cluster}
                            pools={pools}
                            state={state}
                            erasedTrees={erasedTrees}
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
                },
                {
                    key: 'total cpu time spent',
                    value: <Template.Time time={cpuTimeSpent} valueFormat="TimeDuration" />,
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
        const {updateFilter} = this.props;
        updateFilter('state', jobState);
    };

    renderTabs() {
        const {
            match: {
                params: {operationId},
            },
            cluster,
            operation,
            tabSize,
            hasStatististicsTab,
            jobsMonitorVisible,
            monitorTabVisible,
        } = this.props;
        const path = `/${cluster}/${Page.OPERATIONS}/${operationId}`;
        const showSettings = {
            ...getDetailsTabsShowSettings(operation),
            [Tab.STATISTICS]: {show: hasStatististicsTab},
            [Tab.JOBS_MONITOR]: {show: jobsMonitorVisible},
            [Tab.MONITOR]: {show: monitorTabVisible},
        };

        const props = makeTabProps(path, Tab, showSettings);

        return (
            <div className={detailBlock('tabs')}>
                <Tabs
                    {...props}
                    active={DEFAULT_TAB}
                    routed
                    routedPreserveLocation
                    size={tabSize}
                />
            </div>
        );
    }

    renderMain() {
        const {match, cluster, monitorTabVisible, jobsMonitorVisible} = this.props;
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
                        render={() => <OperationAttributes />}
                    />
                    <Route path={`${path}/${Tab.DETAILS}`} component={Details} />
                    <Route path={`${path}/${Tab.SPECIFICATION}`} component={Specification} />
                    <Route path={`${path}/${Tab.STATISTICS}`} component={Statistics} />
                    <Route path={`${path}/${Tab.JOBS}`} component={Jobs} />
                    <Route path={`${path}/${Tab.JOB_SIZES}`} component={JobSizes} />
                    <Route path={`${path}/${Tab.PARTITION_SIZES}`} component={PartitionSizes} />
                    {monitorTabVisible && (
                        <Route
                            path={`${path}/${Tab.MONITOR}`}
                            component={OperationDetailsMonitor}
                        />
                    )}
                    {jobsMonitorVisible && (
                        <Route path={`${path}/${Tab.JOBS_MONITOR}`} component={JobsMonitor} />
                    )}
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

        return <Error message={errorData.message} error={errorData.details} />;
    }

    render() {
        const {error, loading, loaded} = this.props;
        const isFirstLoading = loading && !loaded;

        return (
            <ErrorBoundary>
                <div className={detailBlock({loading: isFirstLoading})}>
                    {error && !loaded ? this.renderError() : this.renderContent(isFirstLoading)}
                </div>
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    const {operation, errorData, loading, loaded, error, actions} = state.operations.detail;
    const totalJobWallTime = getTotalJobWallTime(state);
    const cpuTimeSpent = getTotalCpuTimeSpent(state);
    const erasedTrees = getOperationErasedTrees(state);

    return {
        cluster: getCurrentCluster(state),
        operation,
        errorData,
        loading,
        loaded,
        error,
        actions,
        totalJobWallTime,
        cpuTimeSpent,
        erasedTrees,
        tabSize: getUISizes(state).tabSize,
        monitorTabVisible: Boolean(UIFactory.getMonitorComponentForOperation()),
        jobsMonitorVisible:
            Boolean(UIFactory.getMonitorComponentForJob()) && getJobsMonitorTabVisible(state),
        hasStatististicsTab: getOperationStatiscsHasData(state),
    };
};

const mapDispatchToProps = {
    promptAction,
    getOperation,
    showEditPoolsWeightsModal,
    updateFilter,
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
