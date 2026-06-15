import React from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from '../../../store/redux-hooks';
import {Redirect, Route, Switch, useRouteMatch} from 'react-router';

import {Alert, Flex, Link} from '@gravity-ui/uikit';

import Specification from '../../../pages/job/tabs/Specification/Specification';
import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import {Template} from '../../../components/MetaTable/templates/Template';
import Statistics from '../../../pages/job/tabs/Statistics/Statistics';
import JobBreadcrumbs from '../JobBreadcrumbs/JobBreadcrumbs';
import Statuslabel from '../../../components/StatusLabel/StatusLabel';
import Placeholder from '../../../pages/components/Placeholder';
import Details from '../../../pages/job/tabs/Details/Details';
import JobActions from '../JobActions/JobActions';
import Label from '../../../components/Label';
import {YsonWithScroll} from '../../../components/Yson/YsonWithScroll';
import Tabs from '../../../components/Tabs/Tabs';

import {selectJobGeneralYsonSettings} from '../../../store/selectors/thor/unipika';
import {DEFAULT_TAB, Tab} from '../../../constants/job';
import {type RootState} from '../../../store/reducers';
import {Page} from '../../../constants/index';

import {type TabSettings, makeTabProps} from '../../../utils';
import {formatByParams} from '../../../../shared/utils/format';

import hammer from '../../../common/hammer';
import {type RouteInfo} from '../Job';

import {ClickableText} from '../../../components/ClickableText/ClickableText';
import ChartLink from '../../../components/ChartLink/ChartLink';
import {selectJob} from '../../../store/selectors/job/detail';
import {ClipboardButton, MetaTable} from '@ytsaurus/components';
import {selectCluster, selectClusterUiConfig} from '../../../store/selectors/global';
import UIFactory from '../../../UIFactory';
import {StaleJobIcon} from '../../../pages/operations/OperationDetail/tabs/Jobs/StaleJobIcon';
import {Host} from '../../../containers/Host/Host';

import './JobGeneral.scss';
import {UI_TAB_SIZE} from '../../../constants/global';
import {YsonDownloadButton} from '../../../components/DownloadAttributesButton';
import i18n from './i18n';

const block = cn('job-general');

export default function JobGeneral() {
    const cluster = useSelector(selectCluster);
    const match = useRouteMatch<RouteInfo>();
    const settings = useSelector(selectJobGeneralYsonSettings);
    const job = useSelector(selectJob);
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
        [Tab.DETAILS]: {show: true, title: i18n('tab_details')},
        [Tab.ATTRIBUTES]: {show: true, title: i18n('tab_attributes')},
        [Tab.STATISTICS]: {show: true, title: i18n('tab_statistics')},
        [Tab.SPECIFICATION]: {show: true, title: i18n('tab_specification')},
        [Tab.LOGS]: {show: Boolean(logsTab), title: i18n('tab_logs')},
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
                        {hammer.format['ReadableField'](type)} {i18n('title_job')}
                    </span>
                    <Flex alignItems="center" gap={1}>
                        <Statuslabel label={state} renderPlaque />
                        {Boolean(interruption_info) && (
                            <Label theme="warning">
                                {i18n('value_interrupted', {
                                    reason: hammer.format['ReadableField'](
                                        interruption_info?.interruption_reason,
                                    ),
                                })}
                            </Label>
                        )}
                    </Flex>
                    <JobActions className={block('actions')} />
                </div>

                {isSpeculativeJob && (
                    <Label
                        className={block('speculative-label')}
                        text={i18n('value_speculative-job')}
                        theme="warning"
                        type="text"
                    />
                )}

                <MetaTable
                    className={block('meta')}
                    items={[
                        [
                            {
                                key: i18n('field_operation-id'),
                                value: (
                                    <Template.Link
                                        url={operationUrl}
                                        text={operationId}
                                        withClipboard
                                    />
                                ),
                            },
                            {
                                key: i18n('field_job-id'),
                                value: (
                                    <JobBreadcrumbs id={id} className={block('meta-breadcrumbs')} />
                                ),
                            },
                            {
                                key: i18n('field_host'),
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
                                key: i18n('field_type'),
                                value: <Template.Value value={type} />,
                            },
                            {
                                key: i18n('field_monitoring-descriptor'),
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
                                key: i18n('field_pool-tree'),
                                value: pool_tree,
                                visible: Boolean(pool_tree),
                            },
                        ],
                        [
                            {
                                key: i18n('field_started'),
                                value: <Template.Time time={startTime} valueFormat="DateTime" />,
                            },
                            {
                                key: i18n('field_finished'),
                                value: <Template.Time time={finishTime} valueFormat="DateTime" />,
                            },
                            {
                                key: i18n('field_duration'),
                                value: <Template.Time time={duration} valueFormat="TimeDuration" />,
                            },
                            {
                                key: i18n('field_stale'),
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
                                        {'get_job_input'}
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
                                        {'get_job_stderr'}
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
                                                  {'get_job_fail_context'}
                                              </ClickableText>
                                          ),
                                      },
                                  ]),
                            ...(job?.finishTime
                                ? []
                                : [
                                      {
                                          key: i18n('field_job-ssh'),
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
                                key: i18n('field_job-trace'),
                                value: (
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
                                title={i18n('action_copy-reason')}
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
                        <YsonWithScroll
                            className={block('attributes')}
                            value={attributes}
                            settings={settings}
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

function useJobProfilingUrl({
    operationId,
    jobId,
    pool_tree,
    has_trace,
    cluster,
}: {
    operationId?: string;
    jobId?: string;
    cluster: string;
    has_trace?: boolean;
    pool_tree?: string;
}) {
    const {job_trace_url_template: {url_template, title = 'Open trace', enforce_for_trees} = {}} =
        useSelector(selectClusterUiConfig);
    return React.useMemo(() => {
        const allowTrace = has_trace || 0 <= enforce_for_trees?.indexOf(pool_tree!)!;

        if (!allowTrace || !cluster || !operationId || !jobId || !url_template) {
            return {};
        }
        return {
            url: formatByParams(url_template, {
                operationId,
                jobId,
                cluster,
            }),
            title,
        };
    }, [cluster, operationId, jobId, url_template, title, enforce_for_trees, pool_tree, has_trace]);
}
