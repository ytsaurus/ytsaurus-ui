import React from 'react';

import {type DialogField} from '../../../containers/Dialog';
import {
    MAX_FAILED_JOB_COUNT_PATH,
    type OperationSpecPatchInput,
    getTaskJobCountPath,
} from '../../../utils/operations/specification-patch';

import i18n from './i18n';

type NumberFieldValue = {
    value?: number;
    error?: string;
};

export type SpecificationPatchFormValues = Record<string, unknown> & {
    maxFailedJobCount: NumberFieldValue;
};

export type ResultingOperationSpec = {
    max_failed_job_count?: unknown;
    tasks?: Record<string, {job_count?: unknown}>;
};

function getTaskFieldName(index: number) {
    return `taskJobCount_${index}`;
}

function getPlaceholder(value: unknown) {
    return typeof value === 'number' ? String(value) : undefined;
}

export function getSpecificationPatchTaskNames(resultingSpec?: ResultingOperationSpec) {
    return Object.keys(resultingSpec?.tasks ?? {}).sort();
}

export function getSpecificationPatchInitialValues(): SpecificationPatchFormValues {
    return {
        maxFailedJobCount: {value: undefined},
    };
}

export function makeSpecificationPatchFields(
    resultingSpec?: ResultingOperationSpec,
    disabled = false,
): Array<DialogField<SpecificationPatchFormValues>> {
    const tasks = resultingSpec?.tasks ?? {};
    const taskNames = getSpecificationPatchTaskNames(resultingSpec);

    return [
        {
            name: 'maxFailedJobCount',
            caption: i18n('field_maximum-failed-job-count'),
            type: 'number',
            extras: {
                disabled,
                hidePrettyValue: true,
                placeholder: getPlaceholder(resultingSpec?.max_failed_job_count),
            },
        },
        ...(taskNames.length
            ? [
                  {
                      name: 'tasksTitle',
                      type: 'block' as const,
                      fullWidth: true,
                      extras: {children: <strong>{i18n('section_tasks')}</strong>},
                  },
                  ...taskNames.map((taskName, index) => ({
                      name: getTaskFieldName(index),
                      caption: i18n('field_task-job-count', {taskName}),
                      type: 'number' as const,
                      extras: {
                          disabled,
                          hidePrettyValue: true,
                          placeholder: getPlaceholder(tasks[taskName]?.job_count),
                      },
                  })),
              ]
            : []),
    ];
}

export function getSpecificationPatchFromFormValues(
    values: SpecificationPatchFormValues,
    taskNames: string[],
): OperationSpecPatchInput {
    const result: OperationSpecPatchInput = {};
    const maxFailedJobCount = values.maxFailedJobCount?.value;

    if (maxFailedJobCount !== undefined) {
        result[MAX_FAILED_JOB_COUNT_PATH] = maxFailedJobCount;
    }

    taskNames.forEach((taskName, index) => {
        const value = (values[getTaskFieldName(index)] as NumberFieldValue | undefined)?.value;
        if (value !== undefined) {
            result[getTaskJobCountPath(taskName)] = value;
        }
    });

    return result;
}
