import map_ from 'lodash/map';

import moment from 'moment';

import ypath from '../../common/thor/ypath';
import hammer from '../../common/hammer';
import {createSelector} from 'reselect';
import {remoteInputUrl} from '../../utils/operations/tabs/details/specification/specification';
import {FIX_MY_TYPE} from '../../types';
import {RootState} from '../../store/reducers';
import {JobsState} from '../../store/reducers/operations/jobs/jobs';

interface OperationPool {
    tree: string;
    pool: string;
    isEphemeral: boolean;
    slotIndex?: number;
    weight?: number;
}

export class OperationSelector implements Record<string, any> {
    static PREPARING_STATES = ['materializing', 'initializing', 'preparing', 'pending'] as const;

    static RUNNING_STATES = ['running', 'completing', 'failing', 'aborting', 'reviving'] as const;

    static INTERMEDIATE_STATES = [
        ...OperationSelector.RUNNING_STATES,
        ...OperationSelector.PREPARING_STATES,
    ];

    id: string;
    $value: string;
    $attributes: any;
    state: (typeof OperationSelector.INTERMEDIATE_STATES)[0] | 'completed' | 'failed' | 'aborted';
    pools: Array<OperationPool> = [];

    constructor(data: any) {
        const {id, ...attributes} = data;
        this.$value = id;
        this.id = id;
        this.$attributes = attributes;

        this.state = ypath.getValue(attributes, '/state');
    }

    isRunning() {
        return OperationSelector.RUNNING_STATES.indexOf(this.state as any) !== -1;
    }

    isPreparing() {
        return OperationSelector.PREPARING_STATES.indexOf(this.state as any) !== -1;
    }

    inIntermediateState() {
        return OperationSelector.INTERMEDIATE_STATES.indexOf(this.state as any) !== -1;
    }

    successfullyCompleted() {
        return this.state === 'completed';
    }

    computePools(attributes: any, orchidAttributes?: any) {
        const trees = ypath.getValue(
            attributes,
            '/runtime_parameters/scheduling_options_per_pool_tree',
        );
        const attrsPerPoolTree = ypath.getValue(attributes, '/scheduling_attributes_per_pool_tree');
        const poolsIndexes = ypath.getValue(attributes, '/slot_index_per_pool_tree') || {};

        this.pools = map_(trees, (schedulingInfo, name) => {
            const tree = name;
            const pool = schedulingInfo.pool;
            const isEphemeral = orchidAttributes?.[tree]?.[pool]?.isEphemeral || false;
            const treeData = ypath.getValue(attrsPerPoolTree, `/${tree}`);
            const isLightweight = ypath.getValue(treeData, '/running_in_lightweight_pool') || false;

            return {
                tree,
                pool,
                isEphemeral,
                isLightweight,
                slotIndex: poolsIndexes[name],
                weight: schedulingInfo.weight || 1,
            };
        });
    }
}

export type OperationPreviewType = 'input' | 'output' | 'stderr' | 'intermediate' | 'core';

export class ListOperationSelector extends OperationSelector {
    weight?: number;
    title?: string;
    type?: string;
    user?: string;
    suspended?: boolean;

    input?: IOProperties;
    output?: IOProperties;

    startTime?: string;
    finishTime?: string;
    duration?: number;

    jobs?: any;

    completedJobs?: number;
    runningJobs?: number;
    failedJobs?: number;
    totalJobs?: number;
    completedJobsProgress?: number;
    runningJobsProgress?: number;
    jobsProgress?: number;

    constructor(data: any) {
        super(data);

        const attributes = this.$attributes;

        const briefSpec = ypath.getValue(attributes, '/brief_spec');

        this.title = ypath.getValue(briefSpec, '/title');
        this.type = ypath.getValue(attributes, '/type');
        this.user = ypath.getValue(attributes, '/authenticated_user');
        this.suspended = ypath.getValue(attributes, '/suspended');

        const cluster =
            this.type === 'remote_copy' ? ypath.get(this, '/@brief_spec/cluster_name') : undefined;

        this.input = this.computeIOProperties(briefSpec, 'input', cluster);
        this.output = this.computeIOProperties(briefSpec, 'output');

        this.computePools(attributes);
        if (this.pools.length === 1) {
            this.weight = this.pools[0].weight;
        }

        this.startTime = ypath.getValue(attributes, '/start_time');
        this.finishTime = ypath.getValue(attributes, '/finish_time');
        this.duration = (moment(this.finishTime) as any) - (moment(this.startTime) as any);

        const progress = ypath.getValue(attributes, '/brief_progress');
        const jobs = (this.jobs = ypath.getValue(progress, '/jobs'));

        if (typeof jobs !== 'undefined') {
            this.completedJobs =
                typeof jobs.completed === 'object' ? jobs.completed.total : jobs.completed;
            this.runningJobs = jobs.running;
            this.failedJobs = jobs.failed;
            this.totalJobs = jobs.total;
            this.completedJobsProgress = (this.completedJobs! / this.totalJobs!) * 100;
            this.runningJobsProgress = (this.runningJobs! / this.totalJobs!) * 100;
            this.jobsProgress = this.completedJobsProgress + this.runningJobsProgress;
        }
    }

    computeIOProperties(spec: any, type: string, cluster?: string) {
        const io = ypath.get(spec, '/' + type + '_table_paths');

        const res = {
            count: ypath.getValue(io, '/@count'),
            table: ypath.getValue(io, '/0'),
            url: undefined as undefined | string,
            remote: undefined as undefined | boolean,
        };

        if (cluster) {
            res.url = remoteInputUrl(cluster, res.table);
            res.remote = true;
        }

        return res;
    }
}

export interface IOProperties {
    count: number;
    table: string;
    url?: string;
    remote?: boolean;
}

export class DetailedOperationSelector extends OperationSelector {
    $typedAttributes: unknown;
    $orchidAttributes: unknown;

    alias?: string;

    type?: string;
    user?: string;
    suspended?: boolean;

    startTime?: string;
    finishTime?: string;
    duration?: number;

    jobs?: any;

    completedJobs?: number;
    runningJobs?: number;
    failedJobs?: number;
    totalJobs?: number;
    completedJobsProgress?: number;
    runningJobsProgress?: number;
    jobsProgress?: number;

    totalFailedJobs?: number;
    failedJobsProgress?: number;

    description?: string;
    title?: string;

    typedSpec?: any;
    typedProvidedSpec?: any;
    typedFullSpec?: any;
    typedUnrecognizedSpec?: any;

    live_preview: unknown;

    constructor(data: any, typedData: unknown, orchidData: unknown) {
        super(data);

        this.$typedAttributes = typedData;
        this.$orchidAttributes = orchidData;

        const attributes = this.$attributes;
        const typedAttributes = this.$typedAttributes;
        const orchidAttributes = this.$orchidAttributes;

        const spec = ypath.getValue(attributes, '/spec');
        const fullSpec = ypath.getValue(attributes, '/full_spec');

        this.alias = ypath.getValue(spec, '/alias');

        this.typedSpec = ypath.getValue(typedAttributes, '/spec');
        this.typedProvidedSpec = ypath.getValue(typedAttributes, '/provided_spec');
        this.typedFullSpec = ypath.getValue(typedAttributes, '/full_spec');
        this.typedUnrecognizedSpec = ypath.getValue(typedAttributes, '/unrecognized_spec');

        this.title = ypath.getValue(spec, '/title');

        const runtimeAnnotations = ypath.getValue(attributes, '/runtime_parameters/annotations');
        this.description = ypath.getValue(runtimeAnnotations, '/description');
        // TODO: get rid of the following string when all cluster are updated to 20.1 version
        this.description = this.description || ypath.getValue(spec, '/description');

        this.type =
            ypath.getValue(attributes, '/operation_type') || ypath.getValue(attributes, '/type');
        this.user = ypath.getValue(attributes, '/authenticated_user');
        this.suspended = ypath.getValue(attributes, '/suspended');

        this.startTime = ypath.getValue(attributes, '/start_time');
        this.finishTime = ypath.getValue(attributes, '/finish_time');

        this.duration = (moment(this.finishTime) as any) - (moment(this.startTime) as any);

        this.computePools(attributes, orchidAttributes);

        const progress = ypath.getValue(attributes, '/progress');
        const jobs = (this.jobs = ypath.getValue(progress, '/jobs'));

        if (typeof jobs !== 'undefined') {
            this.completedJobs =
                typeof jobs.completed === 'object' ? jobs.completed.total : jobs.completed;
            this.runningJobs = jobs.running;
            this.totalJobs = jobs.total;
            this.completedJobsProgress = (this.completedJobs! / this.totalJobs!) * 100;
            this.runningJobsProgress = (this.runningJobs! / this.totalJobs!) * 100;
            this.jobsProgress = this.completedJobsProgress + this.runningJobsProgress;

            this.failedJobs = jobs.failed;
            if (fullSpec) {
                this.totalFailedJobs = ypath.getValue(fullSpec, '/max_failed_job_count');
            }
            this.failedJobsProgress = this.totalFailedJobs
                ? (this.failedJobs! / this.totalFailedJobs) * 100
                : 0;
        }

        this.live_preview = ypath.getValue(progress, '/live_preview');
    }

    getLivePreviewPath(
        type: OperationPreviewType,
        index?: number | string,
    ): {path?: string; virtualPath?: string} {
        const hasVirtualPath = ypath.getBoolean(
            this.live_preview,
            `/virtual_table_format/${type}_supported`,
        ) as boolean;

        const hasPath = hasVirtualPath
            ? false
            : (ypath.getBoolean(this.live_preview, `/${type}_supported`) as boolean);

        const suffix = hasVirtualPath ? '/controller_orchid/live_previews' : '';
        const basePath = `//sys/operations/${hammer.utils.extractFirstByte(this.id)}/${
            this.id
        }${suffix}`;

        switch (type) {
            case 'output':
                return makeLivePreview(`${basePath}/output_${index || 0}`, hasVirtualPath, hasPath);
            case 'stderr':
                return makeLivePreview(`${basePath}/stderr`, hasVirtualPath, hasPath);
            case 'intermediate':
                return makeLivePreview(`${basePath}/intermediate`, hasVirtualPath, hasPath);
            case 'core':
                return hasVirtualPath
                    ? makeLivePreview(`${basePath}/core`, hasVirtualPath, false)
                    : {};
        }

        return {};
    }
}

function makeLivePreview(path: string, hasVirtualPath: boolean, hasPath: boolean) {
    return hasVirtualPath ? {virtualPath: path} : {path: hasPath ? path : undefined};
}

export function getCounters(name: string, states: FIX_MY_TYPE, rawCounters: FIX_MY_TYPE) {
    const counters: FIX_MY_TYPE = ypath.getValue(rawCounters, `/${name}_counts`);

    return hammer.filter.countCategoriesNG({
        items: map_(counters, (count, value) => ({count, value})),
        categories: hammer.filter.flattenCategoriesNG(states, 'name'),
        custom: (item: {value: string; count: number}, counters: Record<string, number>) => {
            counters[item.value] += item.count;
            counters['all'] += item.count;
        },
    });
}

export function getActualValue<T>(value: T | undefined, defaultValue?: T) {
    return typeof value === 'undefined' ? defaultValue : value;
}

export function getFilterValue<K extends keyof JobsState['filters']>(name: K) {
    return (state: RootState): JobsState['filters'][K]['value'] | undefined => {
        const {value, defaultValue} = state.operations.jobs.filters[name];

        return getActualValue(value, defaultValue);
    };
}

export function getFilteredAttributes(attributeNames: Array<keyof JobsState['filters']>) {
    return (state: RootState) => {
        return attributeNames.filter((name) => getFilterValue(name)(state));
    };
}

export const getShowCompetitiveJobs = createSelector(
    [getFilterValue('filterBy'), getFilterValue('jobId')],
    (filterBy, jobId) => {
        return filterBy === 'id' && Boolean(jobId);
    },
);
