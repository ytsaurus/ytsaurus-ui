import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import MetaTable, {Template} from '../../../../../../components/MetaTable/MetaTable';
import ElementsTable from '../../../../../../components/ElementsTable/ElementsTable';

import hammer from '../../../../../../common/hammer';
import ypath from '../../../../../../common/thor/ypath';

import './Tasks.scss';
import DetailedJobsCounter from '../DetailedJobsCounter/DetailedJobsCounter';
import {tasksTablesProps} from '../../../../../../utils/operations/tabs/details/tasks';
import {hasProgressTasks} from '../../../../../../utils/operations/tabs/details/data-flow';
import ClickableAttributesButton from '../../../../../../components/AttributesButton/ClickableAttributesButton';
import ExpandIcon from '../../../../../../components/ExpandIcon/ExpandIcon';

const block = cn('jobs');

export const jobsProps = PropTypes.shape({
    abortedJobsTime: PropTypes.number,
    abortedJobsTimeRatio: PropTypes.number,
    averageReadDataRate: PropTypes.number,
    averageReadRowRate: PropTypes.number,
    completedJobsTime: PropTypes.number,
    items: PropTypes.array.isRequired,
    timeStatistics: PropTypes.shape({
        aborted: PropTypes.object,
        completed: PropTypes.object,
    }),
});

function prepareVisibleItems(items, expandedState) {
    const visibleItems = [];
    _.forEach(items, (item) => {
        visibleItems.push(item);
        const {caption} = item;
        if (expandedState[caption]) {
            visibleItems.push({taskInfo: item.info});
        }
    });
    return {
        items,
        visibleItems,
    };
}

export default class Tasks extends Component {
    static propTypes = {
        jobs: jobsProps,
        items: PropTypes.arrayOf([
            PropTypes.shape({
                type: PropTypes.string,
                caption: PropTypes.string,
                jobType: PropTypes.string,
                info: PropTypes.object,
                counters: PropTypes.object,
                abortedStats: PropTypes.object,
                completedStats: PropTypes.object,
            }),
        ]),
    };

    static getDerivedStateFromProps(props, state) {
        const {
            operation,
            jobs: {items},
        } = props;
        const {operation: prevOperation, items: prevItems, expandedState} = state;
        const res = {};
        if (operation !== prevOperation) {
            Object.assign(res, {
                operation,
                allowActions: hasProgressTasks(operation),
            });
        }

        if (items !== prevItems) {
            Object.assign(res, {
                ...prepareVisibleItems(items, expandedState),
            });
        }

        return _.isEmpty(res) ? null : res;
    }

    state = {
        allowActions: false,
        expandedState: {},

        visibleItems: [],

        items: [],
        operation: undefined,
    };

    constructor(props) {
        super(props);

        const self = this;
        this.templates = {
            __default__(item, column) {
                if (!item.counters) {
                    return null;
                }
                return <span>{hammer.format['Number'](item.counters[column])}</span>;
            },
            aborted(item) {
                if (!item?.abortedStats) {
                    return null;
                }
                const {scheduled, nonScheduled} = item.abortedStats;

                return (
                    <DetailedJobsCounter
                        title={`Aborted statistics: ${item.caption}`}
                        secondaryValue={nonScheduled.total}
                        primaryValue={scheduled.total}
                        type="aborted"
                        item={item}
                    />
                );
            },
            completed(item) {
                if (!item?.completedStats) {
                    return null;
                }
                const {nonInterrupted, interrupted} = item.completedStats;

                return (
                    <DetailedJobsCounter
                        title={`Completed statistics: ${item.caption}`}
                        secondaryValue={interrupted.total}
                        primaryValue={nonInterrupted.total}
                        type="completed"
                        item={item}
                    />
                );
            },
            job_type(item) {
                const {caption, jobType, taskInfo, isTotal} = item;
                if (taskInfo) {
                    return <TaskInfo {...taskInfo} />;
                }

                const {expandedState, allowActions} = self.state;
                const expandable = !isTotal && allowActions && caption;

                const expanded = expandedState[caption];
                const onClick = !expandable ? undefined : () => self.toggleExpand(caption);

                return (
                    <div className={block('job-type')}>
                        <div>
                            {Boolean(caption) && (
                                <ExpandIcon
                                    visible={Boolean(onClick)}
                                    expanded={expanded}
                                    onClick={onClick}
                                />
                            )}
                        </div>
                        <div
                            onClick={onClick}
                            className={block('name', {
                                clickable: Boolean(expandable),
                            })}
                        >
                            <span title={`Task ${caption}`}>{caption}</span>
                            {!isTotal && (
                                <React.Fragment>
                                    <br />
                                    {typeof item.jobType !== 'undefined' && (
                                        <span
                                            className={'elements-secondary-text'}
                                            title={`Job type ${jobType}`}
                                        >
                                            {jobType}
                                        </span>
                                    )}
                                </React.Fragment>
                            )}
                        </div>
                    </div>
                );
            },
            actions({info, caption}) {
                if (!info) {
                    return null;
                }
                return <ClickableAttributesButton title={`Tasks: ${caption}`} attributes={info} />;
            },
        };
    }

    toggleExpand(name) {
        const expandedState = {...this.state.expandedState};
        if (expandedState[name]) {
            delete expandedState[name];
        } else {
            expandedState[name] = true;
        }

        this.setState({
            expandedState,
            ...prepareVisibleItems(this.state.items, expandedState),
        });
    }

    rowClassName(item) {
        if (item.taskInfo) {
            return block('row-task-info');
        }
        return item.isTotal ? block('row-total') : undefined;
    }

    colSpan(item, _rowIndex, colIndex) {
        if (item.taskInfo && colIndex === 0) {
            return 8;
        }
    }

    render() {
        const {
            abortedJobsTimeRatio,
            abortedJobsTime,
            completedJobsTime,
            averageReadDataRate,
            averageReadRowRate,
            items,
        } = this.props.jobs;
        const rowRateFormat = (value) => hammer.format['NumberPerSecond'](value, {measure: 'rows'});
        const {allowActions, visibleItems} = this.state;

        return (
            <div className={block()}>
                <MetaTable
                    items={[
                        [
                            {
                                key: 'aborted_jobs_time_ratio',
                                value: (
                                    <Template.FormattedValue
                                        value={abortedJobsTimeRatio}
                                        format="Percent"
                                    />
                                ),
                            },
                            {
                                key: 'aborted_jobs_time',
                                value: (
                                    <Template.FormattedValue
                                        value={abortedJobsTime}
                                        format="TimeDuration"
                                    />
                                ),
                            },
                            {
                                key: 'completed_jobs_time',
                                value: (
                                    <Template.FormattedValue
                                        value={completedJobsTime}
                                        format="TimeDuration"
                                    />
                                ),
                            },
                        ],
                        [
                            {
                                key: 'average_read_data_rate',
                                value: (
                                    <Template.FormattedValue
                                        value={averageReadDataRate}
                                        format="BytesPerSecond"
                                    />
                                ),
                            },
                            {
                                key: 'average_read_row_rate',
                                value: (
                                    <Template.FormattedValue
                                        value={averageReadRowRate}
                                        format={rowRateFormat}
                                    />
                                ),
                            },
                        ],
                    ]}
                />

                <div className={block('table-container')}>
                    {items.length > 0 && (
                        <ElementsTable
                            {...tasksTablesProps}
                            columnsMode={allowActions ? 'withActions' : undefined}
                            items={visibleItems}
                            css={block()}
                            templates={this.templates}
                            rowClassName={this.rowClassName}
                            colSpan={this.colSpan}
                        />
                    )}
                </div>
            </div>
        );
    }
}

function TaskInfo(props) {
    const {
        job_type,
        has_user_job,
        input_finished,
        completed,
        user_job_memory_reserve_factor,
        start_time,
        completion_time,
        ready_time,
        exhaust_time,
    } = props;

    const readyTime = ypath.getValue(ready_time);
    const exhaustTime = ypath.getValue(exhaust_time);

    const timeSum = readyTime + exhaustTime;

    return (
        <MetaTable
            className={block('info-meta')}
            items={[
                [
                    {
                        key: 'job_type',
                        value: <Template.Value value={ypath.getValue(job_type)} />,
                    },
                    {
                        key: 'has_user_job',
                        value: <Template.Readable value={String(ypath.getValue(has_user_job))} />,
                    },
                    {
                        key: 'input_finished',
                        value: <Template.Readable value={String(ypath.getValue(input_finished))} />,
                    },
                    {
                        key: 'completed',
                        value: <Template.Readable value={String(ypath.getValue(completed))} />,
                    },
                    {
                        key: 'user_job_memory_reserve_factor',
                        value: (
                            <Template.Number
                                value={ypath.getValue(user_job_memory_reserve_factor)}
                            />
                        ),
                    },
                    {
                        key: 'start_time',
                        value: <Template.Time time={ypath.getValue(start_time)} />,
                    },
                    {
                        key: 'completion_time',
                        value: <Template.Time time={ypath.getValue(completion_time)} />,
                    },
                ],
                [
                    {
                        key: 'ready_time',
                        value: (
                            <Template.Time
                                time={readyTime}
                                valueFormat={'TimeDuration'}
                                settings={{format: 'milliseconds'}}
                            />
                        ),
                    },
                    {
                        key: 'exhaust_time',
                        value: (
                            <Template.Time
                                time={exhaustTime}
                                valueFormat={'TimeDuration'}
                                settings={{format: 'milliseconds'}}
                            />
                        ),
                    },
                    {
                        key: 'tail_time_fraction',
                        value:
                            timeSum === 0 ? (
                                'n/a'
                            ) : (
                                <Template.FormattedValue
                                    value={(exhaustTime / timeSum) * 100}
                                    format={'Percent'}
                                    settings={{digits: 1}}
                                />
                            ),
                    },
                ],
            ]}
        />
    );
}
