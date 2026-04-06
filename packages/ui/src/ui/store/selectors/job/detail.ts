import {createSelector} from 'reselect';
import ypath from '../../../common/thor/ypath';

import flatten_ from 'lodash/flatten';
import mapValues_ from 'lodash/mapValues';
import map_ from 'lodash/map';
import sumBy_ from 'lodash/sumBy';
import values_ from 'lodash/values';

import {RootState} from '../../reducers';
import {PLEASE_PROCEED_TEXT} from '../../../utils/actions';
import {JobPipes, PipesIO, StatisticsIO} from '../../../types/operations/job';
import {Action as JobAction} from '../../../pages/job/JobActions/JobActions';

const prepareStatisticsIO = (obj: PipesIO, type: string, index?: number): StatisticsIO => {
    return {
        table: index !== undefined ? `${type}:${index}` : type,
        ...mapValues_(obj, (value) => value.sum),
    };
};

export const selectJob = (state: RootState) => state.job.general.job;
const selectJobSpecification = (state: RootState) => state.job.specification.specification;

const selectPipesIO = createSelector(selectJob, (job) => {
    return ypath.getValue(job, '/statistics/user_job/pipes') || {};
});

export const selectTotalTimeIO = createSelector(selectPipesIO, ({input, output}: JobPipes) => {
    return {
        read: input?.['idle_time'].sum,
        write: sumBy_(values_(output), (statistics) => statistics['busy_time'].sum),
    };
});

export const selectJobStatisticsIO = createSelector(
    selectPipesIO,
    ({input, output: {total, ...output}}: JobPipes) => {
        const res = {
            input: [prepareStatisticsIO(input, 'input', 0)],
            output: values_(output).map((outputStatistics: PipesIO, index) =>
                prepareStatisticsIO(outputStatistics, 'output', index),
            ),
        };
        if (total) {
            const last = prepareStatisticsIO(total, 'Total');
            last.isTotal = true;
            res.output.push(last);
        }
        return res;
    },
);

const selectUserCpuTimeSum = createSelector(selectJob, (job): number =>
    ypath.getNumberDeprecated(job, '/statistics/user_job/cpu/user/sum'),
);
const selectWaitCpuTimeSum = createSelector(selectJob, (job): number =>
    ypath.getNumberDeprecated(job, '/statistics/user_job/cpu/wait/sum'),
);

const selectGpuUtilizationSum = createSelector(selectJob, (job): number =>
    ypath.getNumberDeprecated(job, '/statistics/user_job/gpu/cumulative_utilization_gpu/sum'),
);
const selectGpuPowerSum = createSelector(selectJob, (job): number =>
    ypath.getNumberDeprecated(job, '/statistics/user_job/gpu/cumulative_power/sum'),
);
const selectGpuMemorySum = createSelector(selectJob, (job): number =>
    ypath.getNumberDeprecated(job, '/statistics/user_job/gpu/cumulative_memory/sum'),
);

const selectTimeExec = createSelector(selectJob, (job): number =>
    ypath.getNumberDeprecated(job, '/statistics/time/exec/sum'),
);

export const selectAverageUserCpuTime = createSelector(
    [selectUserCpuTimeSum, selectTimeExec],
    (userCpuTimeSum, timeExec) => userCpuTimeSum / timeExec,
);
export const selectAverageWaitCpuTime = createSelector(
    [selectWaitCpuTimeSum, selectTimeExec],
    (waitCpuTimeSum, timeExec) => waitCpuTimeSum / timeExec,
);

export const selectGpuDevices = createSelector(selectJob, (job) =>
    ypath.getNumberDeprecated(job, '/exec_attributes/gpu_devices/length'),
);
export const selectAverageGpuUtilization = createSelector(
    [selectGpuUtilizationSum, selectTimeExec],
    (gpuUtilizationSum, timeExec) => gpuUtilizationSum / timeExec,
);
export const selectAverageGpuPower = createSelector(
    [selectGpuPowerSum, selectTimeExec],
    (gpuPowerSum, timeExec) => gpuPowerSum / timeExec,
);
export const selectAverageGpuMemory = createSelector(
    [selectGpuMemorySum, selectTimeExec],
    (gpuMemorySum, timeExec) => gpuMemorySum / timeExec,
);

export const selectJobPivotKeysData = createSelector([selectJobSpecification], (specification) => {
    const inputTableSpecs = ypath.getValue(specification, '/input_table_specs');

    return flatten_(
        map_(inputTableSpecs, (tableSpec) => {
            const chunkSpecs = ypath.getValue(tableSpec, '/chunk_specs');

            return map_(chunkSpecs, (chunkSpec) => {
                const id = ypath.getValue(chunkSpec, '/chunk_id');

                const fromKey = map_(ypath.getValue(chunkSpec, '/lower_limit/key'), (key) =>
                    ypath.getValue(key),
                );
                const fromIndex = [ypath.getValue(chunkSpec, '/lower_limit/row_index')];
                const from = !fromKey || fromKey.length === 0 ? fromIndex : fromKey;

                const toKey = map_(ypath.getValue(chunkSpec, '/upper_limit/key'), (key) =>
                    ypath.getValue(key),
                );
                const toIndex = [ypath.getValue(chunkSpec, '/upper_limit/row_index')];
                const to = !toKey || toKey.length === 0 ? toIndex : toKey;

                return {id, from, to};
            });
        }),
    );
});

export const selectJobActions = createSelector(selectJob, (job) => {
    const actions: JobAction[] = [];
    const state = job?.state;

    if (state !== 'completed' && state !== 'failed' && state !== 'aborted') {
        actions.push({
            modalKey: 'abort',
            name: 'abort',
            successMessage: 'Job was successfully aborted. Please wait',
            icon: 'redo',
            message: 'Job will be immediately aborted. Are you sure you want to proceed?',
            confirmationText: PLEASE_PROCEED_TEXT,
        });

        actions.push({
            modalKey: 'interrupt',
            name: 'interrupt',
            successMessage: 'Job was successfully aborted. Please wait',
            icon: 'hand-paper',
            message: 'Job will be immediately interrupted. Are you sure you want to proceed?',
            confirmationText: PLEASE_PROCEED_TEXT,
            optionMessage: 'Interruption timeout',
            optionValue: 10000,
            optionType: 'input',
            options: [
                {
                    data: {
                        parameters: {interrupt_timeout: 10000},
                    },
                    value: 'timeout',
                    text: 'timeout',
                },
            ],
        });
    }

    if (state === 'running') {
        actions.push({
            modalKey: 'abandon',
            name: 'abandon',
            successMessage: 'Job was successfully aborted. Please wait',
            icon: 'trash-bin',
            message:
                'Job will be aborted, but considered as completed, output data of job will be lost. Do you want to proceed?',
            confirmationText: PLEASE_PROCEED_TEXT,
        });
    }

    return actions;
});
