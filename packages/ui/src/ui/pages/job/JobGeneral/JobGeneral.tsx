import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {Redirect, Route, Switch, useRouteMatch} from 'react-router';

import Specification from '../../../pages/job/tabs/Specification/Specification';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import MetaTable, {Template} from '../../../components/MetaTable/MetaTable';
import Statistics from '../../../pages/job/tabs/Statistics/Statistics';
import JobBreadcrumbs from '../JobBreadcrumbs/JobBreadcrumbs';
import Statuslabel from '../../../components/StatusLabel/StatusLabel';
import Placeholder from '../../../pages/components/Placeholder';
import Details from '../../../pages/job/tabs/Details/Details';
import JobActions from '../JobActions/JobActions';
import Label from '../../../components/Label/Label';
import Yson from '../../../components/Yson/Yson';
import Tabs from '../../../components/Tabs/Tabs';

import {getJobGeneralYsonSettings} from '../../../store/selectors/thor/unipika';
import {DEFAULT_TAB, Tab} from '../../../constants/job';
import {RootState} from '../../../store/reducers';
import {Page} from '../../../constants/index';
import {makeTabProps} from '../../../utils';
import hammer from '../../../common/hammer';
import {RouteInfo} from '../Job';

import ChartLink from '../../../components/ChartLink/ChartLink';
import Link from '../../../components/Link/Link';
import {getJob} from '../../../store/selectors/job/detail';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import {getCluster, getUISizes} from '../../../store/selectors/global';
import UIFactory from '../../../UIFactory';
import {StaleJobIcon} from '../../../pages/operations/OperationDetail/tabs/Jobs/StaleJobIcon';

import './JobGeneral.scss';

const block = cn('job-general');

export default function JobGeneral() {
    const cluster = useSelector(getCluster);
    const match = useRouteMatch<RouteInfo>();
    const settings = useSelector(getJobGeneralYsonSettings);
    const job = useSelector(getJob);
    const {loaded} = useSelector((state: RootState) => state.job.general);
    const {tabSize} = useSelector(getUISizes);

    if (!loaded) {
        return null;
    }

    const {url, params} = match;
    const {operationID, jobID} = params;
    const {
        operationId,
        attributes,
        finishTime,
        startTime,
        duration,
        address,
        state,
        type,
        id,
        jobCompetitionId,
        monitoring_descriptor,
        pool_tree,
        is_stale,
    } = job;
    const operationUrl = `/${cluster}/${Page.OPERATIONS}/${operationID}/jobs?jobId=${jobID}`;
    const path = `/${cluster}/${Page.JOB}/${operationID}/${jobID}`;
    const tabsProps = makeTabProps(path, Tab);

    const isSpeculativeJob = jobCompetitionId && jobCompetitionId !== id;

    const jobShellCommand = `yt --proxy ${cluster} run-job-shell ${id}`;

    return (
        <ErrorBoundary>
            <div className={block(null, 'elements-section')}>
                <div className={block('header')}>
                    <span className={block('heading')}>
                        {hammer.format['ReadableField'](type)} job
                    </span>

                    <Statuslabel label={state} renderPlaque />

                    <JobActions />
                </div>

                {isSpeculativeJob && (
                    <Label
                        className={block('speculative-label')}
                        text="Speculative job"
                        theme="warning"
                        type="text"
                    />
                )}

                <MetaTable
                    className={block('meta')}
                    items={[
                        [
                            {
                                key: 'operation id',
                                value: (
                                    <Template.Link
                                        url={operationUrl}
                                        text={operationId}
                                        withClipboard
                                    />
                                ),
                            },
                            {
                                key: 'job id',
                                value: (
                                    <JobBreadcrumbs id={id} className={block('meta-breadcrumbs')} />
                                ),
                            },
                            {
                                key: 'host',
                                value: (
                                    <span className={block('meta-host')}>
                                        <Template.Id id={address?.split(':')[0]} />
                                        <ChartLink
                                            url={UIFactory.makeUrlForNodeIO(cluster, address)}
                                        />
                                    </span>
                                ),
                            },
                            {
                                key: 'type',
                                value: <Template.Value value={type} />,
                            },
                            {
                                key: 'Monitoring descriptor',
                                value: (
                                    <span className={block('meta-host')}>
                                        <Template.Id id={monitoring_descriptor} />
                                        <ChartLink
                                            url={UIFactory.makeUrlForMonitoringDescriptor(
                                                cluster,
                                                {
                                                    from: startTime,
                                                    to: finishTime,
                                                },
                                                monitoring_descriptor,
                                            )}
                                        />
                                    </span>
                                ),
                                visible: Boolean(monitoring_descriptor),
                            },
                            {
                                key: 'Pool tree',
                                value: pool_tree,
                                visible: Boolean(pool_tree),
                            },
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
                                key: 'Stale',
                                value: (
                                    <>
                                        {Boolean('is_stale').toString() + ' '}
                                        <StaleJobIcon />
                                    </>
                                ),
                                visible: is_stale,
                            },
                        ],
                        [
                            {
                                key: 'job_input',
                                value: (
                                    <Link
                                        onClick={() =>
                                            window.open(job.prepareCommandURL('get_job_input'))
                                        }
                                    >
                                        get_job_input
                                    </Link>
                                ),
                            },
                            {
                                key: 'job_error',
                                value: (
                                    <Link
                                        onClick={() =>
                                            window.open(job.prepareCommandURL('get_job_stderr'))
                                        }
                                    >
                                        get_job_stderr
                                    </Link>
                                ),
                            },
                            ...(job?.state !== 'failed'
                                ? []
                                : [
                                      {
                                          key: 'fail_context',
                                          value: (
                                              <Link
                                                  onClick={() =>
                                                      window.open(
                                                          job.prepareCommandURL(
                                                              'get_job_fail_context',
                                                          ),
                                                      )
                                                  }
                                              >
                                                  get_job_fail_context
                                              </Link>
                                          ),
                                      },
                                  ]),
                            ...(job?.finishTime
                                ? []
                                : [
                                      {
                                          key: 'Job ssh',
                                          value: (
                                              <span className={block('meta-ssh')}>
                                                  <span
                                                      className={block('meta-ssh-cmd')}
                                                      title={jobShellCommand}
                                                  >
                                                      {jobShellCommand}
                                                  </span>
                                                  <ClipboardButton
                                                      view={'flat-secondary'}
                                                      text={jobShellCommand}
                                                      size={'s'}
                                                  />
                                              </span>
                                          ),
                                      },
                                  ]),
                        ],
                    ]}
                />

                <div className={block('tabs')}>
                    <Tabs {...tabsProps} active={DEFAULT_TAB} routed size={tabSize} />
                </div>

                <Switch>
                    <Route path={`${path}/${Tab.ATTRIBUTES}`}>
                        <Yson value={attributes} settings={settings} folding />
                    </Route>
                    <Route path={`${path}/${Tab.DETAILS}`}>
                        <Details />
                    </Route>
                    <Route path={`${path}/${Tab.STATISTICS}`}>
                        <Statistics />
                    </Route>
                    <Route path={`${path}/${Tab.SPECIFICATION}`}>
                        <Specification jobID={jobID} />
                    </Route>
                    <Route path={`${path}/:tab`}>
                        <Placeholder />
                    </Route>
                    <Redirect from={url} to={`${path}/${DEFAULT_TAB}`} />
                </Switch>
            </div>
        </ErrorBoundary>
    );
}
