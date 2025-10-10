import qs from 'qs';

import some_ from 'lodash/some';

import moment from 'moment';

// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import {makeDirectDownloadPath} from '../../../../../utils/navigation';
import {ClusterConfig, ListJobsItem, OperationType} from '../../../../../../shared/yt-types';
import {YTError} from '../../../../../types';
import {JobState, JobStatistics, RawJob, RawJobEvent} from '../../../../../types/operations/job';

type JobsData = ListJobsItem | RawJob;

export class Job implements RawJob {
    static USER_ERROR_CODE = 10000;
    static USER_ERROR = 'user_error';
    static SYSTEM_ERROR = 'system_error';

    static hasUserErrorCode(error: YTError): boolean {
        if (error.code === Job.USER_ERROR_CODE) {
            return true;
        } else if (error.inner_errors && error.inner_errors.length) {
            return some_(error.inner_errors, Job.hasUserErrorCode);
        } else {
            return false;
        }
    }

    static getErrorType(error: YTError) {
        return Job.hasUserErrorCode(error) ? Job.USER_ERROR : Job.SYSTEM_ERROR;
    }

    cluster: ClusterConfig['id'];
    proxy: ClusterConfig['proxy'];
    externalProxy: ClusterConfig['externalProxy'];
    operationId: string;
    job_id: string;
    id: string;

    start_time?: string;
    startTime?: string;
    finish_time?: string;
    finishTime?: string;
    inputPaths?: ListJobsItem['input_paths'];

    address!: string;
    archive_state!: string;
    has_competitors!: boolean;
    has_spec!: boolean;
    job_competition_id!: string;
    operation_id!: string;
    state!: JobState;
    type!: OperationType;
    events!: RawJobEvent[];
    exec_attributes!: object;
    statistics!: JobStatistics;
    monitoring_descriptor?: string | undefined;
    pool_tree?: string | undefined;
    is_stale?: boolean | undefined;
    archive_features?: {has_trace?: boolean} | undefined;
    interruption_info?:
        | {
              interruption_reason: string;
              interruption_timeout?: number;
              preempted_for?: {allocation_id?: string; operation_id?: string};
              preemption_reason?: string;
          }
        | undefined;
    error?: YTError | undefined;

    duration?: number;

    attributes: JobsData;

    brief_statistics: Record<string, number> = {};

    constructor({
        job,
        operationId,
        clusterConfig,
    }: {
        job: JobsData;
        operationId: string;
        clusterConfig: ClusterConfig;
    }) {
        const {id: cluster, proxy, externalProxy} = clusterConfig ?? {};

        this.cluster = cluster;
        this.proxy = proxy;
        this.externalProxy = externalProxy;
        this.operationId = operationId;
        this.attributes = job;

        Object.assign(this, job);

        this.startTime = job.start_time;
        this.finishTime = job.finish_time;
        this.inputPaths = (job as ListJobsItem).input_paths;
        this.job_id = this.id = (job as ListJobsItem).id ?? (job as RawJob).job_id;

        this.duration = moment(this.finishTime).diff(this.startTime);

        // XXX Fix zero start time bug for all jobs
        if (
            this.startTime === '1970-01-01T00:00:00.000000Z' &&
            typeof this.finishTime === 'undefined'
        ) {
            this.startTime = undefined;
            this.duration = undefined;
        }

        this.computeBriefStatistics(job as RawJob);
    }

    areInputPathsPresent() {
        return Boolean(this.attributes.has_spec);
    }

    computeBriefStatistics({statistics}: RawJob) {
        if (statistics === undefined) {
            return;
        }

        const [cpu, compressedSize, weight, rowCount, uncompressedSize] = ypath.getValues(
            statistics,
            [
                '/job_proxy/cpu/user/sum',
                '/data/input/compressed_data_size/sum',
                '/data/input/data_weight/sum',
                '/data/input/row_count/sum',
                '/data/input/uncompressed_data_size/sum',
            ],
        );
        this.brief_statistics = {};
        this.brief_statistics['job_proxy_cpu_usage'] = cpu;
        this.brief_statistics['processed_input_compressed_data_size'] = compressedSize;
        this.brief_statistics['processed_input_data_weight'] = weight;
        this.brief_statistics['processed_input_row_count'] = rowCount;
        this.brief_statistics['processed_input_uncompressed_data_size'] = uncompressedSize;
    }

    prepareCommandURL(commandName: 'get_job_stderr' | 'get_job_fail_context' | 'get_job_input') {
        const params = qs.stringify({
            operation_id: this.operationId,
            job_id: this.id,
            dump_error_into_response: true,
        });

        const path = makeDirectDownloadPath(commandName, {
            cluster: this.cluster,
            proxy: this.proxy,
            externalProxy: this.externalProxy,
        });

        return `${path}?${params}`;
    }

    getDebugInfo(name: 'stderr' | 'fail_context' | 'full_input') {
        switch (name) {
            case 'stderr':
                return {
                    size: (this.attributes as ListJobsItem).stderr_size,
                    url: this.prepareCommandURL('get_job_stderr'),
                };
            case 'fail_context':
                return {
                    size: (this.attributes as ListJobsItem).fail_context_size,
                    url: this.prepareCommandURL('get_job_fail_context'),
                };
            case 'full_input':
                return {
                    url: this.prepareCommandURL('get_job_input'),
                };
        }
    }
}
