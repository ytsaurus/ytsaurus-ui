import cn from 'bem-cn-lite';
import React, {Component} from 'react';
import {type ConnectedProps, connect} from 'react-redux';

import {Progress} from '@gravity-ui/uikit';
import Link from '../../../containers/Link/Link';

import hammer from '../../../common/hammer';
import StatusLabel from '../../../components/StatusLabel/StatusLabel';

import {type RootState} from '../../../store/reducers';
import {selectCluster} from '../../../store/selectors/global';
import {type DetailedOperationSelector} from '../selectors';
import i18n from './i18n';
import './OperationProgress.scss';

const block = cn('operation-progress');

type CounterState = 'running' | 'completed' | 'failed';

type OperationProgressProps = {
    operation: DetailedOperationSelector;
    type: 'running' | 'failed';
    showState?: boolean;

    onLinkClick: (state: CounterState) => void;
};

type ReduxProps = ConnectedProps<typeof connector>;

class OperationProgress extends Component<OperationProgressProps & ReduxProps> {
    static defaultProps = {
        type: 'running' as const,
    };

    renderCounter(state: CounterState, count?: number, total?: number) {
        const {cluster, onLinkClick} = this.props;

        const className = 'operation-progress__counter';
        const stateClassName = 'operation-progress__counter-state';
        const valueClassName = 'operation-progress__counter-value';

        const {
            operation: {$value},
        } = this.props;
        const url = `/${cluster}/operations/${$value}/jobs?state=${state}`;

        const jobsByStateTitle = i18n('context_view-state-jobs', {state});

        return (
            <div className={className}>
                <span className={stateClassName}>
                    <Link
                        theme="ghost"
                        title={jobsByStateTitle}
                        url={url}
                        routed
                        onClick={
                            !onLinkClick
                                ? undefined
                                : () => {
                                      onLinkClick(state);
                                  }
                        }
                    >
                        {i18n(`state_${state}`)}
                    </Link>
                </span>
                <span className={valueClassName}>
                    {hammer.format['Number'](count)}
                    &nbsp; / &nbsp;
                    {hammer.format['Number'](total)}
                </span>
            </div>
        );
    }

    renderFailedJobCounters() {
        const {operation} = this.props;
        const {failedJobs, totalFailedJobs} = operation;

        const className = 'operation-progress__counters';

        return (
            typeof totalFailedJobs !== 'undefined' && (
                <div className={className}>
                    {this.renderCounter('failed', failedJobs, totalFailedJobs)}
                </div>
            )
        );
    }

    renderJobCounters() {
        const {operation} = this.props;
        const {state, totalJobs, failedJobs, completedJobs, runningJobs} = operation;

        const className = 'operation-progress__counters';

        return operation.isPreparing()
            ? null
            : typeof totalJobs !== 'undefined' && (
                  <div className={className}>
                      {operation.inIntermediateState() &&
                          this.renderCounter('running', runningJobs, totalJobs)}
                      {state === 'failed' && this.renderCounter('failed', failedJobs, totalJobs)}
                      {this.renderCounter('completed', completedJobs, totalJobs)}
                  </div>
              );
    }

    renderState() {
        const {
            showState,
            operation: {suspended, state},
        } = this.props;

        return !showState ? null : (
            <div className={block('state')}>
                <StatusLabel label={suspended ? 'suspended' : state} />
            </div>
        );
    }

    renderFailedProgressBar() {
        const {operation} = this.props;
        const {failedJobsProgress} = operation;

        const className = 'operation-progress__bar';

        return (
            <div className={className}>
                {this.renderState()}
                <Progress size="s" value={failedJobsProgress || 0} theme="danger" />
            </div>
        );
    }

    renderProgressBar() {
        const {operation} = this.props;
        const {
            state,
            jobsProgress = 0,
            completedJobsProgress = 0,
            runningJobsProgress = 0,
        } = operation;

        const RESOLVED_PROGRESS = 100;
        const PENDING_PROGRESS = 0;

        let progressBar;

        if (operation.inIntermediateState()) {
            progressBar = (
                <Progress
                    size="s"
                    value={jobsProgress}
                    stack={[
                        {
                            value: completedJobsProgress,
                            theme: 'success',
                        },
                        {value: runningJobsProgress, theme: 'info'},
                    ]}
                />
            );
        } else {
            switch (state) {
                case 'completed':
                    progressBar = <Progress size="s" value={RESOLVED_PROGRESS} theme="success" />;
                    break;
                case 'failed':
                    progressBar = <Progress size="s" value={RESOLVED_PROGRESS} theme="danger" />;
                    break;
                case 'aborted':
                    progressBar = <Progress size="s" value={RESOLVED_PROGRESS} />;
                    break;
                default:
                    progressBar = <Progress size="s" value={PENDING_PROGRESS} />;
                    break;
            }
        }

        const className = 'operation-progress__bar';

        return (
            <div className={className}>
                {this.renderState()}
                {progressBar}
            </div>
        );
    }
    render() {
        const className = 'operation-progress';
        const {type} = this.props;
        return (
            <div className={className}>
                {type === 'running' ? this.renderProgressBar() : this.renderFailedProgressBar()}
                {type === 'running' ? this.renderJobCounters() : this.renderFailedJobCounters()}
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        cluster: selectCluster(state),
    };
};

const connector = connect(mapStateToProps);

export default connector(OperationProgress);
