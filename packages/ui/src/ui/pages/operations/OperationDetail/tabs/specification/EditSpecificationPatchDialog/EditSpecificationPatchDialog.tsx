import React from 'react';

import {Alert} from '@gravity-ui/uikit';

import {type YTError} from '../../../../../../../@types/types';
import {type DialogField, YTDFDialog, makeErrorFields} from '../../../../../../containers/Dialog';
import {useDispatch} from '../../../../../../store/redux-hooks';
import {patchOperationSpec} from '../../../../../../store/actions/operations/detail';
import {docsUrl} from '../../../../../../config';
import UIFactory from '../../../../../../UIFactory';
import HelpLink from '../../../../../../components/HelpLink/HelpLink';
import {
    type KnownOperationSpecPatchValues,
    type OperationSpecPatchInput,
    extractKnownOperationSpecPatchValues,
    mergeKnownOperationSpecPatchValues,
    operationSpecPatchToItems,
} from '../../../../../../utils/operations/specification-patch';

import i18n from '../i18n';

type EditorMode = 'form' | 'json';

type NumberFieldValue = {
    value?: number;
    error?: string;
};

type JsonFieldValue = {
    value?: string;
    error?: string;
};

type FormValues = Record<string, unknown> & {
    mode: EditorMode;
    patch: {value?: string; error?: string};
    maxFailedJobCount: NumberFieldValue;
};

type Props = {
    operationId: string;
    resultingSpec?: {
        max_failed_job_count?: unknown;
        tasks?: Record<string, {job_count?: unknown}>;
    };
    visible: boolean;
    onClose: () => void;
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
    values: FormValues,
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
        const values = allValues as FormValues;
        const previousMode = (previousValues as FormValues | undefined)?.mode;

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

export function EditSpecificationPatchDialog({
    operationId,
    resultingSpec,
    visible,
    onClose,
}: Props) {
    const dispatch = useDispatch();
    const [error, setError] = React.useState<YTError | Error | undefined>();
    const tasks = resultingSpec?.tasks ?? {};
    const taskNames = Object.keys(tasks).sort();

    const handleClose = React.useCallback(() => {
        setError(undefined);
        onClose();
    }, [onClose]);

    const fields: Array<DialogField<FormValues>> = [
        {
            name: 'mode',
            caption: i18n('field_editor-mode'),
            type: 'radio',
            extras: {
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
            extras: {initialShowPreview: false, minHeight: 200},
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
        ...makeErrorFields([error]),
    ];

    return (
        visible && (
            <YTDFDialog<FormValues>
                visible
                size="l"
                headerProps={{title: i18n('title_edit-specification')}}
                footerProps={{textApply: i18n('action_apply-patch')}}
                initialValues={{
                    mode: 'form',
                    patch: {value: '{\n  \n}'},
                    maxFailedJobCount: {value: undefined},
                }}
                onClose={handleClose}
                onAdd={async (form) => {
                    setError(undefined);

                    try {
                        const values = form.getState().values;
                        const parsedPatch = parsePatch(values.patch);
                        const patch =
                            values.mode === 'form'
                                ? mergeKnownOperationSpecPatchValues(
                                      parsedPatch,
                                      getKnownValuesFromForm(values, taskNames),
                                      taskNames,
                                  )
                                : parsedPatch;
                        await dispatch(
                            patchOperationSpec(operationId, operationSpecPatchToItems(patch)),
                        );
                        return undefined;
                    } catch (caughtError) {
                        const apiError = caughtError as YTError | Error;
                        setError(apiError);
                        return Promise.reject(apiError);
                    }
                }}
                fields={fields}
            />
        )
    );
}
