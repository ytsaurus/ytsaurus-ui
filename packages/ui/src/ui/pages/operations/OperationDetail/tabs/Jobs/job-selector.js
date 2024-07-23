import qs from 'qs';

import some_ from 'lodash/some';
import mapKeys_ from 'lodash/mapKeys';

import moment from 'moment';

import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import {makeDirectDownloadPath} from '../../../../../utils/navigation';

export default class Job {
    constructor({job, operationId, clusterConfig}) {
        const {id: cluster, proxy, externalProxy} = clusterConfig ?? {};

        this.cluster = cluster;
        this.proxy = proxy;
        this.externalProxy = externalProxy;
        this.operationId = operationId;
        this.computeProperties(job);
        this.attributes = job;
    }

    static mapping = {
        start_time: 'startTime',
        finish_time: 'finishTime',
        stderr_size: 'stderrSize',
        fail_context_size: 'failContextSize',
        input_paths: 'inputPaths',
        has_spec: 'hasSpec',
        job_competition_id: 'jobCompetitionId',
        job_id: 'id',
        has_competitors: 'hasCompetitors',
    };

    areInputPathsPresent() {
        const {hasSpec} = this;
        return Boolean(hasSpec);
    }

    computeProperties(attributes) {
        const mappedAttributes = mapKeys_(attributes, (value, key) => Job.mapping[key] || key);
        Object.assign(this, mappedAttributes);

        this.duration = moment(this.finishTime) - moment(this.startTime);

        // XXX Fix zero start time bug for all jobs
        if (
            this.startTime === '1970-01-01T00:00:00.000000Z' &&
            typeof this.finishTime === 'undefined'
        ) {
            this.startTime = undefined;
            this.duration = undefined;
        }

        if (typeof this.statistics !== 'undefined') {
            this.computeBriefStatistics(this.statistics);
        }
    }

    computeBriefStatistics(statistics) {
        const briefStatistics = {};
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
        briefStatistics['job_proxy_cpu_usage'] = cpu;
        briefStatistics['processed_input_compressed_data_size'] = compressedSize;
        briefStatistics['processed_input_data_weight'] = weight;
        briefStatistics['processed_input_row_count'] = rowCount;
        briefStatistics['processed_input_uncompressed_data_size'] = uncompressedSize;
        this['brief_statistics'] = briefStatistics;
    }

    prepareCommandURL(commandName) {
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

    getDebugInfo(name) {
        switch (name) {
            case 'stderr':
                return {
                    size: this.stderrSize,
                    url: this.prepareCommandURL('get_job_stderr'),
                };
            case 'fail_context':
                return {
                    size: this.failContextSize,
                    url: this.prepareCommandURL('get_job_fail_context'),
                };
            case 'full_input':
                return {
                    url: this.prepareCommandURL('get_job_input'),
                };
        }
    }

    static USER_ERROR_CODE = 10000;
    static USER_ERROR = 'user_error';
    static SYSTEM_ERROR = 'system_error';

    static hasUserErrorCode(error) {
        if (error.code === Job.USER_ERROR_CODE) {
            return true;
        } else if (error.inner_errors && error.inner_errors.length) {
            return some_(error.inner_errors, Job.hasUserErrorCode);
        } else {
            return false;
        }
    }

    static getErrorType(error) {
        return Job.hasUserErrorCode(error) ? Job.USER_ERROR : Job.SYSTEM_ERROR;
    }
}
