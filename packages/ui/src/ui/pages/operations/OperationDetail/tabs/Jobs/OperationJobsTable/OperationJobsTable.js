import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import ypath from '../../../../../../common/thor/ypath';
import unipika from '../../../../../../common/thor/unipika';
import hammer from '../../../../../../common/hammer';
import ElementsTable from '../../../../../../components/ElementsTable/ElementsTable';
import {OPERATION_JOBS_TABLE_ID} from '../../../../../../constants/operations/jobs';
import SimpleModal from '../../../../../../components/Modal/SimpleModal';
import {YTErrorBlock} from '../../../../../../components/Error/Error';

import ClipboardButton from '../../../../../../components/ClipboardButton/ClipboardButton';
import ChartLink from '../../../../../../components/ChartLink/ChartLink';
import MetaTable from '../../../../../../components/MetaTable/MetaTable';
import Yson from '../../../../../../components/Yson/Yson';
import Link from '../../../../../../components/Link/Link';
import CollapsibleSection from '../../../../../../components/CollapsibleSection/CollapsibleSection';

import {
    getCompetitiveJobs,
    getJobs,
    hideInputPaths,
    showInputPaths,
} from '../../../../../../store/actions/operations/jobs';
import {openAttributesModal} from '../../../../../../store/actions/modals/attributes-modal';
import {promptAction, showErrorModal} from '../../../../../../store/actions/actions';
import {performJobAction} from '../utils';
import {LOADING_STATUS} from '../../../../../../constants/index';
import {PLEASE_PROCEED_TEXT} from '../../../../../../utils/actions';
import {getShowCompetitiveJobs} from '../../../../../../pages/operations/selectors';
import {getJobsOperationId} from '../../../../../../store/selectors/operations/jobs';
import {
    getOperationId,
    getOperationTasksNames,
} from '../../../../../../store/selectors/operations/operation';
import UIFactory from '../../../../../../UIFactory';
import {StaleJobIcon} from '../StaleJobIcon';

import JobTemplate from './JobTemplate';
import './OperationJobsTable.scss';
import {UI_COLLAPSIBLE_SIZE} from '../../../../../../constants/global';
import {JobDetails} from './JobDetails';
import EllipsisIcon from '@gravity-ui/icons/svgs/ellipsis.svg';
import {StatusInfo} from './StatusInfo';

const block = cn('operation-detail-jobs');

class OperationJobsTable extends React.Component {
    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        // from connect
        jobs: PropTypes.arrayOf(PropTypes.object),
        job: PropTypes.object,
        showCompetitiveJobs: PropTypes.bool.isRequired,
        competitiveJobs: PropTypes.arrayOf(PropTypes.object),
        cluster: PropTypes.string.isRequired,
        login: PropTypes.string.isRequired,
        inputPaths: PropTypes.shape({
            status: PropTypes.oneOf(Object.values(LOADING_STATUS)).isRequired,
            paths: PropTypes.arrayOf(PropTypes.string),
            error: PropTypes.shape({
                message: PropTypes.string,
                details: PropTypes.object,
            }),
        }),

        openAttributesModal: PropTypes.func.isRequired,
        showErrorModal: PropTypes.func.isRequired,
        showInputPaths: PropTypes.func.isRequired,
        hideInputPaths: PropTypes.func.isRequired,
        promptAction: PropTypes.func.isRequired,
        getJobs: PropTypes.func.isRequired,
        getCompetitiveJobs: PropTypes.func.isRequired,
        taskNamesNumber: PropTypes.number,
    };

    actions = [
        {
            name: 'abort',
            modalKey: 'job_abort',
            successMessage: 'Successfully aborted the job.',
            errorMessage: 'Could not abort the job.',
            text: 'Abort',
            message:
                'Aborting job will cause losing its progress, are you sure you want to proceed?',
            confirmationText: PLEASE_PROCEED_TEXT,
        },
        {
            name: 'abandon',
            modalKey: 'job_abandon',
            successMessage: 'Successfully abandoned the job.',
            errorMessage: 'Could not abandon the job.',
            text: 'Abandon',
            message:
                'Abandoning job will cause losing its progress, are you sure you want to proceed?',
            confirmationText: PLEASE_PROCEED_TEXT,
        },
        {
            name: 'input_context',
            modalKey: 'job_input_context',
            message: (
                <span>
                    You are about to <strong>dump input context</strong> of the job
                </span>
            ),
            text: 'Dump input context',
            successMessageTemplate: (data) => {
                const url = `/${this.props.cluster}/navigation?path=${data}`;
                return (
                    <span>
                        Successfully dumped the job input context <Link url={url}>here</Link>
                    </span>
                );
            },
            errorMessage: 'Could not dump the job input context.',
        },
    ];

    prepareJobAction = ({text, ...settings}) => {
        const {login, promptAction} = this.props;
        const message = settings.message || (
            <span>
                You are about to <strong>{settings.name}</strong> a job.
            </span>
        );

        return {
            text: text,
            action: (params) =>
                promptAction({
                    ...settings,
                    message,
                    handler: ({currentOption}) => {
                        const finalParams = {
                            ...params,
                            name: settings.name,
                            currentOption,
                            login,
                        };
                        return performJobAction(finalParams);
                    },
                }),
        };
    };

    preparedActions = map_(this.actions, this.prepareJobAction);

    renderIdAddress = (item) => {
        const {cluster} = this.props;
        const {id, address, job_competition_id, operationId, is_stale, attributes} = item;
        const host = hammer.format['Address'](address);

        const from = ypath.getValue(attributes, '/start_time');
        const to = ypath.getValue(attributes, '/finish_time');
        const monitoring_descriptor = ypath.getValue(attributes, '/monitoring_descriptor');

        const isSpeculativeJob = job_competition_id && job_competition_id !== id;

        return (
            <div>
                <div className={block('id', 'elements-monospace')}>
                    <ClipboardButton text={id} view="flat-secondary" size="s" title="Copy job id" />
                    <Link
                        className={block('id-job-link')}
                        routed
                        url={`/${cluster}/job/${operationId}/${id}`}
                        theme={'primary'}
                    >
                        {id}
                    </Link>
                    {is_stale && <StaleJobIcon />}
                </div>
                <div className={block('host', 'elements-monospace')}>
                    <span className={block('host-name')}>
                        <ClipboardButton
                            text={host}
                            view="flat-secondary"
                            size="s"
                            title="Copy host"
                        />
                        {host}
                    </span>
                    <span className={block('host-chart-link')}>
                        <ChartLink
                            url={UIFactory.makeUrlForMonitoringDescriptor(
                                cluster,
                                {from, to},
                                monitoring_descriptor,
                            )}
                        />
                    </span>
                </div>
                {isSpeculativeJob && (
                    <Fragment>
                        <br />
                        <span
                            className={block(
                                'speculative-job-label',
                                'elements-monospace elements-ellipsis',
                            )}
                        >
                            Speculative job for {job_competition_id}
                        </span>
                    </Fragment>
                )}
            </div>
        );
    };

    renderErrorAndDebug = (item) => {
        const items = [
            {
                key: 'error',
                value: <JobTemplate.Error error={item.error} />,
                visible: Boolean(item.error),
            },
            {
                key: 'input_paths',
                value: <JobTemplate.InputPaths job={item} />,
                visible: item.areInputPathsPresent(),
            },
            {
                key: 'stderr',
                value: <JobTemplate.DebugInfo job={item} type="stderr" />,
                visible: item.getDebugInfo('stderr').size > 0,
            },
            {
                key: 'fail_context',
                value: <JobTemplate.DebugInfo job={item} type="fail_context" />,
                visible: item.getDebugInfo('fail_context').size > 0,
            },
            {
                key: 'full_input',
                value: <JobTemplate.DebugInfo job={item} type="full_input" />,
                visible: Boolean(item.has_spec),
            },
        ];

        return <MetaTable items={items} />;
    };

    renderActions = (item) => {
        const {openAttributesModal} = this.props;

        const button = (
            <Button view="flat-secondary" title="Show actions">
                <Icon data={EllipsisIcon} size={16} />
            </Button>
        );
        const firstGroup = map_(this.preparedActions, ({action, text}) => ({
            text,
            action: () => action({item}),
        }));

        const secondGroup = [
            {
                text: 'Show attributes',
                action: () =>
                    openAttributesModal({
                        title: item.id,
                        attributes: item.attributes,
                    }),
            },
        ];

        return item.state === 'running' ? (
            <DropdownMenu switcher={button} items={[firstGroup, secondGroup]} />
        ) : (
            <DropdownMenu switcher={button} items={secondGroup} />
        );
    };

    settings = {
        css: block(),
        theme: 'light',
        size: 's',
        striped: false,
        virtual: false,
        tableId: OPERATION_JOBS_TABLE_ID,
        computeKey: (item) => item.id,
        columns: {
            items: {
                id_address: {
                    name: 'id_address',
                    align: 'left',
                    caption: 'Id / Address',
                    sort: false,
                },
                task_name: {
                    name: 'task_name',
                    align: 'left',
                    caption: 'Task name',
                    sort: true,
                },
                start_time: {
                    name: 'start_time',
                    align: 'left',
                    caption: 'Start time',
                    sort: true,
                },
                finish_time: {
                    name: 'finish_time',
                    align: 'left',
                    caption: 'Finish time',
                    sort: true,
                },
                duration: {
                    get(job) {
                        return job.duration;
                    },
                    sort: true,
                    name: 'duration',
                    align: 'left',
                },
                error: {
                    name: 'error',
                    align: 'left',
                    caption: 'Error / Debug',
                    get: (job) => job.error,
                },
                type: {
                    name: 'type',
                    align: 'left',
                    sort: true,
                },
                progress: {
                    name: 'progress',
                    align: 'left',
                    sort: true,
                },
                actions: {
                    name: 'actions',
                    align: 'right',
                    caption: '',
                    sort: false,
                },
            },
            sets: {
                default: {
                    items: [
                        'id_address',
                        'type',
                        'progress',
                        'error',
                        'start_time',
                        'finish_time',
                        'duration',
                        'actions',
                    ],
                },
                withTaskName: {
                    items: [
                        'id_address',
                        'type',
                        'progress',
                        'error',
                        'task_name',
                        'start_time',
                        'finish_time',
                        'duration',
                        'actions',
                    ],
                },
            },
            mode: this.props.taskNamesNumber > 1 ? 'withTaskName' : 'default',
        },
        templates: {
            id_address: this.renderIdAddress,
            type: this.renderType,
            progress: this.renderProgress,
            error: this.renderErrorAndDebug,
            start_time: this.renderStartTime,
            finish_time: this.renderFinishTime,
            duration: this.renderDuration,
            actions: this.renderActions,
            task_name: this.renderTaskName,
        },
    };

    renderTaskName(item) {
        return <div className={block('task-name', 'elements-ellipsis')}>{item.task_name}</div>;
    }

    renderProgress(item) {
        const {state, progress, brief_statistics, type, interruption_info} = item;

        return (
            <div className={block('state')}>
                <div className={block('state-section', 'elements-ellipsis')}>
                    <StatusInfo info={interruption_info} state={state} />
                </div>
                <div className={block('state-section')}>
                    <JobTemplate.Progress state={state} progress={progress} />
                </div>
                <JobDetails statistics={brief_statistics} type={type} />
            </div>
        );
    }

    renderStartTime(item) {
        return (
            <span className={block('start-time', 'elements-ellipsis')}>
                {hammer.format['DateTime'](item.startTime)}
            </span>
        );
    }

    renderFinishTime(item) {
        return item.state === 'running' ? (
            <span className={block('in-progress', 'elements-ellipsis elements-secondary-text')}>
                In progress...
            </span>
        ) : (
            <span className={block('finish-time elements-ellipsis')}>
                {hammer.format['DateTime'](item.finishTime)}
            </span>
        );
    }

    renderDuration(item) {
        return (
            <span className="elements-ellipsis">
                {hammer.format['TimeDuration'](item.duration)}
            </span>
        );
    }

    renderType(item) {
        return <span>{hammer.format['ReadableField'](item.type)}</span>;
    }

    renderInputPathsModal() {
        const {
            inputPaths: {paths, status, error},
            hideInputPaths,
        } = this.props;

        if (status === LOADING_STATUS.UNINITIALIZED) {
            return null;
        }

        const ysonSettings = unipika.prepareSettings();
        const content =
            status === LOADING_STATUS.ERROR ? (
                <YTErrorBlock {...error} />
            ) : (
                <Yson value={paths} settings={ysonSettings} />
            );

        return (
            <SimpleModal
                visible
                onCancel={hideInputPaths}
                loading={status === LOADING_STATUS.LOADING}
                onOutsideClick={hideInputPaths}
                title="Input paths"
            >
                {content}
            </SimpleModal>
        );
    }

    render() {
        const {jobs, showCompetitiveJobs, getJobs, isLoading, collapsibleSize} = this.props;
        if (showCompetitiveJobs) {
            const {job, competitiveJobs, getCompetitiveJobs} = this.props;
            return (
                <Fragment>
                    {this.renderInputPathsModal()}
                    <ElementsTable
                        {...this.settings}
                        items={[job].filter(Boolean)}
                        onSort={getCompetitiveJobs}
                        isLoading={isLoading}
                    />
                    {competitiveJobs.length > 0 && (
                        <CollapsibleSection
                            name="All competitive jobs"
                            className={block('competitive-jobs')}
                            collapsed={true}
                            size={collapsibleSize}
                        >
                            <ElementsTable
                                {...this.settings}
                                items={competitiveJobs}
                                onSort={getCompetitiveJobs}
                                isLoading={isLoading}
                            />
                        </CollapsibleSection>
                    )}
                </Fragment>
            );
        }
        return (
            <Fragment>
                {this.renderInputPathsModal()}
                <ElementsTable
                    {...this.settings}
                    items={jobs}
                    onSort={getJobs}
                    isLoading={isLoading}
                />
            </Fragment>
        );
    }
}

function mapStateToProps(state, props) {
    const {operations, global} = state;
    const {cluster, login} = global;
    const showCompetitiveJobs = getShowCompetitiveJobs(state);
    const taskNamesNumber = getOperationTasksNames(state)?.length;
    const jobsOperationId = getJobsOperationId(state);
    const operationId = getOperationId(state);
    const {jobs, job, competitiveJobs, inputPaths} = operations.jobs;
    return {
        jobs: operationId !== jobsOperationId ? [] : jobs,
        job,
        competitiveJobs,
        showCompetitiveJobs,
        inputPaths,
        cluster,
        login,
        collapsibleSize: UI_COLLAPSIBLE_SIZE,
        isLoading: props.isLoading || operationId !== jobsOperationId,
        taskNamesNumber,
    };
}

const mapDispatchToProps = {
    openAttributesModal,
    showInputPaths,
    hideInputPaths,
    showErrorModal,
    promptAction,
    getJobs,
    getCompetitiveJobs,
};

export default connect(mapStateToProps, mapDispatchToProps)(OperationJobsTable);
