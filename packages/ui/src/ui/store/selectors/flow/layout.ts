import {createSelector} from 'reselect';
import map_ from 'lodash/map';

import {RootState} from '../../../store/reducers';

export const getFlowLayoutPipelinePath = (state: RootState) => state.flow.layout.pipeline_path;
export const getFlowLayoutError = (state: RootState) => state.flow.layout.error;
const getFlowLayoutExpandedComputations = (state: RootState) =>
    state.flow.layout.expandedComputations;

const getFlowLayoutRawData = (state: RootState) => state.flow.layout.data;

const getFlowLayoutRows = createSelector([getFlowLayoutRawData], (data) => {
    const {jobs = {}, partitions} = data?.execution_spec?.layout?.value ?? {};
    return map_(partitions, (item) => {
        const job = jobs[item.current_job_id!];
        const {worker_address} = job ?? {};
        const worker = data?.workers[worker_address];
        return {
            partition: item,
            job: job ?? null,
            worker: worker ?? null,
        };
    });
});

type RowData = ReturnType<typeof getFlowLayoutRows>[number];
type ComputationRow = {
    $value: Array<RowData>;
    $attributes: {
        computation_id: string;
        expanded: boolean;
        job_count: number;
        worker_count: number;
    };
};

export type FlowLayoutDataItem = RowData | ComputationRow;

export const getFlowLayoutData = createSelector(
    [getFlowLayoutRows, getFlowLayoutExpandedComputations],
    (rows, expandedComputations) => {
        const expanded = new Set(Object.keys(expandedComputations));
        const computations: Array<ComputationRow> = [];
        const computationsByName = new Map<string, ComputationRow>();
        rows.forEach((item) => {
            const {computation_id} = item.partition;
            let dst = computationsByName.get(computation_id);
            if (!dst) {
                dst = {
                    $attributes: {
                        computation_id,
                        expanded: expanded.has(computation_id),
                        job_count: 0,
                        worker_count: 0,
                    },
                    $value: [],
                };
                computationsByName.set(computation_id, dst!);
                computations.push(dst!);
            }
            if (item.job) {
                ++dst!.$attributes.job_count;
            }
            if (item.worker) {
                ++dst!.$attributes.worker_count;
            }
            dst!.$value?.push(item);
        });

        if (!expanded.size) {
            return computations;
        }

        let res: Array<FlowLayoutDataItem> = [];
        for (const item of computations) {
            const {computation_id} = item.$attributes;
            if (expanded.has(computation_id)) {
                res = res.concat(item, item.$value);
            } else {
                res.push(item);
            }
        }

        return res;
    },
);
