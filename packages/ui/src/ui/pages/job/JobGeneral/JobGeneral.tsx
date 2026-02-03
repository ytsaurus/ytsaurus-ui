import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from '../../../store/redux-hooks';
import {Redirect, Route, Switch, useRouteMatch} from 'react-router';

import {Alert, Flex, Link} from '@gravity-ui/uikit';

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

import {TabSettings, makeTabProps} from '../../../utils';

import hammer from '../../../common/hammer';
import {RouteInfo} from '../Job';

import {ClickableText} from '../../../components/ClickableText/ClickableText';
import ChartLink from '../../../components/ChartLink/ChartLink';
import {getJob} from '../../../store/selectors/job/detail';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import {getCluster} from '../../../store/selectors/global';
import UIFactory from '../../../UIFactory';
import {StaleJobIcon} from '../../../pages/operations/OperationDetail/tabs/Jobs/StaleJobIcon';
import {Host} from '../../../containers/Host/Host';

import './JobGeneral.scss';
import {UI_TAB_SIZE} from '../../../constants/global';
import {YsonDownloadButton} from '../../../components/DownloadAttributesButton';
import {useJobProfilingUrl} from './hooks/useJobProfilingUrl';

const block = cn('job-general');

export default function JobGeneral() {
    const cluster = useSelector(getCluster);
    const match = useRouteMatch<RouteInfo>();
    const settings = useSelector(getJobGeneralYsonSettings);
    const job = useSelector(getJob);
    const {loaded} = useSelector((state: RootState) => state.job.general);

    const {url: traceUrl, title: traceTitle} = useJobProfilingUrl({
        operationId: job?.operationId,
        jobId: job?.id,
        has_trace: job?.archive_features?.has_trace,
        pool_tree: job?.pool_tree,
        cluster,
    });

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
        job_competition_id,
        monitoring_descriptor,
        pool_tree,
        is_stale,
        interruption_info,
    } = job || {};
    const operationUrl = `/${cluster}/${Page.OPERATIONS}/${operationID}/jobs?jobId=${jobID}`;
    const path = `/${cluster}/${Page.JOB}/${operationID}/${jobID}`;

    const logsTab = UIFactory.renderJobLogsTab();

    const showSettings: Record<string, TabSettings> = {
        [Tab.DETAILS]: {show: true},
        [Tab.ATTRIBUTES]: {show: true},
        [Tab.STATISTICS]: {show: true},
        [Tab.SPECIFICATION]: {show: true},
        [Tab.LOGS]: {show: Boolean(logsTab)},
    };
    const tabsProps = makeTabProps(path, Tab, showSettings);

    const isSpeculativeJob = job_competition_id && job_competition_id !== id;

    const jobShellCommand = `yt --proxy ${cluster} run-job-shell ${id}`;
    const preemptionReason = hammer.format['ReadableField'](interruption_info?.preemption_reason);

    return (
        <ErrorBoundary>
            <div className={block(null, 'elements-section')}>
                <div className={block('header')}>
                    <span className={block('heading')}>
                        {hammer.format['ReadableField'](type)} job
                    </span>
                    <Flex alignItems="center" gap={1}>
                        <Statuslabel label={state} renderPlaque />
                        {Boolean(interruption_info) && (
                            <Label theme="warning">
                                Interrupted (
                                {hammer.format['ReadableField'](
                                    interruption_info?.interruption_reason,
                                )}
                                )
                            </Label>
                        )}
                    </Flex>
                    <JobActions className={block('actions')} />
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
                                        <Host address={address!} />
                                        <ChartLink
                                            url={UIFactory.makeUrlForNodeIO(cluster, address)}
                                        />
                                    </span>
                                ),
                                visible: Boolean(address),
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
                                                    from: startTime || '',
                                                    to: finishTime || '',
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
                                    <ClickableText
                                        onClick={() =>
                                            window.open(job?.prepareCommandURL('get_job_input'))
                                        }
                                    >
                                        get_job_input
                                    </ClickableText>
                                ),
                            },
                            {
                                key: 'job_error',
                                value: (
                                    <ClickableText
                                        onClick={() =>
                                            window.open(job?.prepareCommandURL('get_job_stderr'))
                                        }
                                    >
                                        get_job_stderr
                                    </ClickableText>
                                ),
                            },
                            ...(job?.state !== 'failed'
                                ? []
                                : [
                                      {
                                          key: 'fail_context',
                                          value: (
                                              <ClickableText
                                                  onClick={() =>
                                                      window.open(
                                                          job?.prepareCommandURL(
                                                              'get_job_fail_context',
                                                          ),
                                                      )
                                                  }
                                              >
                                                  get_job_fail_context
                                              </ClickableText>
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
                            {
                                key: 'Job trace',
                                value: (
                                    //
                                    <Link target="_blank" href={traceUrl!}>
                                        {traceTitle}
                                    </Link>
                                ),
                                visible: Boolean(traceUrl),
                            },
                        ],
                    ]}
                />

                {Boolean(preemptionReason) && (
                    <Alert
                        theme="info"
                        layout="horizontal"
                        message={preemptionReason}
                        actions={
                            <ClipboardButton
                                title="Copy reason"
                                view="flat-secondary"
                                size="s"
                                text={preemptionReason}
                                className={block('popup-button')}
                            />
                        }
                    />
                )}

                <div className={block('tabs')}>
                    <Tabs {...tabsProps} active={DEFAULT_TAB} routed size={UI_TAB_SIZE} />
                </div>

                <Switch>
                    <Route path={`${path}/${Tab.ATTRIBUTES}`}>
                        <Yson
                            className={block('attributes')}
                            value={attributes}
                            settings={settings}
                            folding
                            extraTools={
                                <YsonDownloadButton
                                    value={attributes}
                                    settings={settings}
                                    name={`attributes_job_${id}`}
                                />
                            }
                        />
                    </Route>
                    <Route path={`${path}/${Tab.DETAILS}`}>
                        <Details />
                    </Route>
                    <Route path={`${path}/${Tab.STATISTICS}`}>
                        <Statistics />
                    </Route>
                    <Route path={`${path}/${Tab.SPECIFICATION}`}>
                        <Specification className={block('specification')} jobID={jobID} />
                    </Route>
                    {logsTab ? <Route path={`${path}/${Tab?.LOGS}`}>{logsTab}</Route> : null}
                    <Route path={`${path}/:tab`}>
                        <Placeholder />
                    </Route>
                    <Redirect from={url} to={`${path}/${DEFAULT_TAB}`} />
                </Switch>
            </div>
        </ErrorBoundary>
    );
}
