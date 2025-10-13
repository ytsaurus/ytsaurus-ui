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

export const getJob = (state: RootState) => state.job.general.job;
const getJobSpecification = (state: RootState) => state.job.specification.specification;

const getPipesIO = createSelector(getJob, (job) => {
    return ypath.getValue(job, '/statistics/user_job/pipes') || {};
});

export const getTotalTimeIO = createSelector(getPipesIO, ({input, output}: JobPipes) => {
    return {
        read: input?.['idle_time'].sum,
        write: sumBy_(values_(output), (statistics) => statistics['busy_time'].sum),
    };
});

export const getJobStatisticsIO = createSelector(
    getPipesIO,
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

const getUserCpuTimeSum = createSelector(getJob, (job): number =>
    ypath.getNumberDeprecated(job, '/statistics/user_job/cpu/user/sum'),
);
const getWaitCpuTimeSum = createSelector(getJob, (job): number =>
    ypath.getNumberDeprecated(job, '/statistics/user_job/cpu/wait/sum'),
);

const getGpuUtilizationSum = createSelector(getJob, (job): number =>
    ypath.getNumberDeprecated(job, '/statistics/user_job/gpu/cumulative_utilization_gpu/sum'),
);
const getGpuPowerSum = createSelector(getJob, (job): number =>
    ypath.getNumberDeprecated(job, '/statistics/user_job/gpu/cumulative_power/sum'),
);
const getGpuMemorySum = createSelector(getJob, (job): number =>
    ypath.getNumberDeprecated(job, '/statistics/user_job/gpu/cumulative_memory/sum'),
);

const getTimeExec = createSelector(getJob, (job): number =>
    ypath.getNumberDeprecated(job, '/statistics/time/exec/sum'),
);

export const getAverageUserCpuTime = createSelector(
    [getUserCpuTimeSum, getTimeExec],
    (userCpuTimeSum, timeExec) => userCpuTimeSum / timeExec,
);
export const getAverageWaitCpuTime = createSelector(
    [getWaitCpuTimeSum, getTimeExec],
    (waitCpuTimeSum, timeExec) => waitCpuTimeSum / timeExec,
);

export const getGpuDevices = createSelector(getJob, (job) =>
    ypath.getNumberDeprecated(job, '/exec_attributes/gpu_devices/length'),
);
export const getAverageGpuUtilization = createSelector(
    [getGpuUtilizationSum, getTimeExec],
    (gpuUtilizationSum, timeExec) => gpuUtilizationSum / timeExec,
);
export const getAverageGpuPower = createSelector(
    [getGpuPowerSum, getTimeExec],
    (gpuPowerSum, timeExec) => gpuPowerSum / timeExec,
);
export const getAverageGpuMemory = createSelector(
    [getGpuMemorySum, getTimeExec],
    (gpuMemorySum, timeExec) => gpuMemorySum / timeExec,
);

export const getJobPivotKeysData = createSelector([getJobSpecification], (specification) => {
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

export const getJobActions = createSelector(getJob, (job) => {
    const actions: JobAction[] = [];
    const state = job.state;

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
