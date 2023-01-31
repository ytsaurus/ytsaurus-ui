import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import {Progress} from '@gravity-ui/uikit';
import Link from '../../../components/Link/Link';

import hammer from '../../../common/hammer';
import StatusLabel from '../../../components/StatusLabel/StatusLabel';

import './OperationProgress.scss';
import {getCluster} from '../../../store/selectors/global';

const block = cn('operation-progress');

class OperationProgress extends Component {
    static propTypes = {
        // from parent
        operation: PropTypes.object.isRequired,
        type: PropTypes.oneOf(['running', 'failed']),
        cluster: PropTypes.string.isRequired,
        showState: PropTypes.bool,

        onLinkClick: PropTypes.func,
    };

    static defaultProps = {
        type: 'running',
    };

    renderCounter(state, count, total) {
        const {cluster, onLinkClick} = this.props;

        const className = 'operation-progress__counter';
        const stateClassName = 'operation-progress__counter-state';
        const valueClassName = 'operation-progress__counter-value';

        const {
            operation: {$value},
        } = this.props;
        const url = `/${cluster}/operations/${$value}/jobs?state=${state}`;

        const jobsByStateTitle = `View ${state} jobs`;

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
                        {hammer.format['ReadableField'](state)}
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
                <Progress view="thin" value={failedJobsProgress || 0} theme="danger" />
            </div>
        );
    }

    renderProgressBar() {
        const {operation} = this.props;
        const {state, jobsProgress, completedJobsProgress, runningJobsProgress} = operation;

        const RESOLVED_PROGRESS = 100;
        const PENDING_PROGRESS = 0;

        let progressBar;

        switch (state) {
            case 'running':
                progressBar = operation.inIntermediateState() && (
                    <Progress
                        view="thin"
                        value={jobsProgress || 0}
                        stack={[
                            {
                                value: completedJobsProgress || 0,
                                theme: 'success',
                            },
                            {value: runningJobsProgress || 0, theme: 'info'},
                        ]}
                    />
                );
                break;
            case 'completed':
                progressBar = <Progress view="thin" value={RESOLVED_PROGRESS} theme="success" />;
                break;
            case 'failed':
                progressBar = <Progress view="thin" value={RESOLVED_PROGRESS} theme="danger" />;
                break;
            case 'aborted':
                progressBar = <Progress view="thin" value={RESOLVED_PROGRESS} theme="default" />;
                break;
            default:
                progressBar = <Progress view="thin" value={PENDING_PROGRESS || 0} />;
                break;
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

const mapStateToProps = (state) => {
    return {
        cluster: getCluster(state),
    };
};

export default connect(mapStateToProps)(OperationProgress);
