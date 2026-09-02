import React from 'react';

import {Alert} from '@gravity-ui/uikit';

import {type DialogField} from '../../../containers/Dialog';
import {docsUrl} from '../../../config';
import UIFactory from '../../../UIFactory';
import HelpLink from '../../../components/HelpLink/HelpLink';
import {
    type KnownOperationSpecPatchValues,
    type OperationSpecPatchInput,
    extractKnownOperationSpecPatchValues,
    mergeKnownOperationSpecPatchValues,
} from '../../../utils/operations/specification-patch';

import i18n from './i18n';

type EditorMode = 'form' | 'json';

type NumberFieldValue = {
    value?: number;
    error?: string;
};

type JsonFieldValue = {
    value?: string;
    error?: string;
};

export type SpecificationPatchFormValues = Record<string, unknown> & {
    mode: EditorMode;
    patch: JsonFieldValue;
    maxFailedJobCount: NumberFieldValue;
};

export type ResultingOperationSpec = {
    max_failed_job_count?: unknown;
    tasks?: Record<string, {job_count?: unknown}>;
};

const FORM_VISIBILITY = {
    when: 'mode',
    isActive: (mode: unknown) => mode === 'form',
};

const JSON_VISIBILITY = {
    when: 'mode',
    isActive: (mode: unknown) => mode === 'json',
};

function getTaskFieldName(index: number) {
    return `taskJobCount_${index}`;
}

function parsePatch(value: JsonFieldValue): OperationSpecPatchInput {
    return JSON.parse(value.value || '{}') as OperationSpecPatchInput;
}

function getKnownValuesFromForm(
    values: SpecificationPatchFormValues,
    taskNames: string[],
): KnownOperationSpecPatchValues {
    return {
        maxFailedJobCount: values.maxFailedJobCount?.value,
        taskJobCounts: Object.fromEntries(
            taskNames.map((taskName, index) => [
                taskName,
                (values[getTaskFieldName(index)] as NumberFieldValue | undefined)?.value,
            ]),
        ),
    };
}

function makeModeSubscribers(taskNames: string[]) {
    return (mode: EditorMode, _field: string, allValues?: object, previousValues?: object) => {
        const values = allValues as SpecificationPatchFormValues;
        const previousMode = (previousValues as SpecificationPatchFormValues | undefined)?.mode;

        if (!values || mode === previousMode) {
            return {};
        }

        if (mode === 'form') {
            try {
                const knownValues = extractKnownOperationSpecPatchValues(
                    parsePatch(values.patch),
                    taskNames,
                );

                return Object.fromEntries([
                    ['maxFailedJobCount', {value: knownValues.maxFailedJobCount}],
                    ...taskNames.map((taskName, index) => [
                        getTaskFieldName(index),
                        {value: knownValues.taskJobCounts[taskName]},
                    ]),
                ]);
            } catch {
                return {mode: 'json'};
            }
        }

        try {
            const patch = mergeKnownOperationSpecPatchValues(
                parsePatch(values.patch),
                getKnownValuesFromForm(values, taskNames),
                taskNames,
            );
            return {patch: {value: JSON.stringify(patch, null, 2)}};
        } catch {
            return {};
        }
    };
}

function getPlaceholder(value: unknown) {
    return typeof value === 'number' ? String(value) : undefined;
}

export function getSpecificationPatchTaskNames(resultingSpec?: ResultingOperationSpec) {
    return Object.keys(resultingSpec?.tasks ?? {}).sort();
}

export function getSpecificationPatchInitialValues(): SpecificationPatchFormValues {
    return {
        mode: 'form',
        patch: {value: '{\n  \n}'},
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
            name: 'mode',
            caption: i18n('field_editor-mode'),
            type: 'radio',
            extras: {
                disabled,
                options: [
                    {value: 'form', label: i18n('value_form')},
                    {value: 'json', label: i18n('value_json')},
                ],
            },
            subscribers: makeModeSubscribers(taskNames),
        },
        {
            name: 'maxFailedJobCount',
            caption: i18n('field_maximum-failed-job-count'),
            type: 'number',
            visibilityCondition: FORM_VISIBILITY,
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
                      visibilityCondition: FORM_VISIBILITY,
                      extras: {children: <strong>{i18n('section_tasks')}</strong>},
                  },
                  ...taskNames.map((taskName, index) => ({
                      name: getTaskFieldName(index),
                      caption: i18n('field_task-job-count', {taskName}),
                      type: 'number' as const,
                      visibilityCondition: FORM_VISIBILITY,
                      extras: {
                          disabled,
                          hidePrettyValue: true,
                          placeholder: getPlaceholder(tasks[taskName]?.job_count),
                      },
                  })),
              ]
            : []),
        {
            name: 'patch',
            caption: i18n('field_specification-patch'),
            type: 'json',
            fullWidth: true,
            visibilityCondition: JSON_VISIBILITY,
            extras: {disabled, initialShowPreview: false, minHeight: 200},
        },
        {
            name: 'patchHelp',
            type: 'block',
            visibilityCondition: JSON_VISIBILITY,
            extras: {
                children: (
                    <Alert
                        theme="info"
                        message={
                            <div>
                                {i18n('context_supported-patch-paths')}{' '}
                                {docsUrl(
                                    <HelpLink
                                        url={
                                            UIFactory.docsUrls['api:commands#patch_operation_spec']
                                        }
                                    />,
                                )}
                            </div>
                        }
                    />
                ),
            },
        },
    ];
}

export function getSpecificationPatchFromFormValues(
    values: SpecificationPatchFormValues,
    taskNames: string[],
): OperationSpecPatchInput {
    const patch = parsePatch(values.patch);

    return values.mode === 'form'
        ? mergeKnownOperationSpecPatchValues(
              patch,
              getKnownValuesFromForm(values, taskNames),
              taskNames,
          )
        : patch;
}
