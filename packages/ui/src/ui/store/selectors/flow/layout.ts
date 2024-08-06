import {createSelector} from 'reselect';
import map_ from 'lodash/map';
import forEach_ from 'lodash/forEach';

import {RootState} from '../../../store/reducers';

export const getFlowLayoutPipelinePath = (state: RootState) => state.flow.layout.pipeline_path;
export const getFlowLayoutError = (state: RootState) => state.flow.layout.error;
const getFlowLayoutExpandedComputations = (state: RootState) =>
    state.flow.layout.expandedComputations;
const getFlowLayoutExpandedWorkers = (state: RootState) => state.flow.layout.expandedWorkers;

const getFlowLayoutRawData = (state: RootState) => state.flow.layout.data;

type RowData = Pick<
    ReturnType<typeof getFlowLayoutPartitions>[number],
    'job' | 'partition' | 'worker'
>;
type LayoutExpandable = {
    $value: Array<Exclude<FlowLayoutDataItem, LayoutExpandable>>;
    $attributes: {
        name: string;
        expanded: boolean;
        job_count: number;
        worker_count: number;
        partition_count: number;
    };
};

export type FlowLayoutDataItem = {[K in keyof RowData]: RowData[K] | null} | LayoutExpandable;

export const getFlowLayoutData = createSelector(
    [getFlowLayoutRawData, getFlowLayoutExpandedComputations, getFlowLayoutExpandedWorkers],
    (data, expandedComputations, expandedWorkers) => {
        return (mode: 'computations' | 'workers') => {
            switch (mode) {
                case 'computations':
                    return handleExpandedNames(getFlowLayoutPartitions(data), expandedComputations);
                case 'workers':
                    return handleExpandedNames(getFlowLayoutWorkers(data), expandedWorkers);
            }
        };
    },
);

function getFlowLayoutPartitions(data: ReturnType<typeof getFlowLayoutRawData>) {
    const {jobs = {}, partitions} = data?.execution_spec?.layout?.value ?? {};
    return map_(partitions, (item) => {
        const job = jobs[item.current_job_id!];
        const {worker_address} = job ?? {};
        const worker = data?.workers[worker_address];
        return {
            name: item.computation_id,
            partition: (item as typeof item | undefined) ?? null,
            job: (job as typeof job | undefined) ?? null,
            worker: worker ?? null,
        };
    });
}

function getFlowLayoutWorkers(data: ReturnType<typeof getFlowLayoutRawData>) {
    const {jobs, partitions} = data?.execution_spec?.layout?.value ?? {};

    const res: ReturnType<typeof getFlowLayoutPartitions> = [];
    const visitedWorkers = new Set<string>();

    forEach_(jobs, (job) => {
        const {worker_address, partition_id} = job;
        const partition = partitions?.[partition_id];
        const worker = data?.workers[worker_address];
        res.push({
            name: worker_address,
            partition: partition ?? null,
            job: job ?? null,
            worker: worker ?? null,
        });

        visitedWorkers.add(worker_address);
    });
    forEach_(data?.workers, (item) => {
        const {address} = item;
        if (!visitedWorkers.has(address)) {
            res.push({name: address, partition: null, job: null, worker: null});
        }
    });

    return res;
}

function handleExpandedNames(
    rows: Array<RowData & {name: string}>,
    expandedNames: Record<string, true>,
) {
    const expanded = new Set(Object.keys(expandedNames));
    const groups: Array<LayoutExpandable> = [];
    const groupsByName = new Map<string, LayoutExpandable>();
    rows.forEach((item) => {
        const {name, ...rest} = item;
        let dst = groupsByName.get(name);
        if (!dst) {
            dst = {
                $attributes: {
                    name: name,
                    expanded: expanded.has(name),
                    job_count: 0,
                    worker_count: 0,
                    partition_count: 0,
                },
                $value: [],
            };
            groupsByName.set(name, dst!);
            groups.push(dst!);
        }
        if (item.job) {
            ++dst!.$attributes.job_count;
        }
        if (item.worker) {
            ++dst!.$attributes.worker_count;
        }
        if (item.partition) {
            ++dst!.$attributes.partition_count;
        }
        dst!.$value?.push(rest);
    });

    if (!expanded.size) {
        return groups;
    }

    let res: Array<FlowLayoutDataItem> = [];
    for (const item of groups) {
        const {name} = item.$attributes;
        if (expanded.has(name)) {
            res = res.concat(item, item.$value);
        } else {
            res.push(item);
        }
    }

    return res;
}
