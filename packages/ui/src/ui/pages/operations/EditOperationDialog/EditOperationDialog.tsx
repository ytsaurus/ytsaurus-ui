import React, {useMemo, useState} from 'react';

import {Loader} from '@gravity-ui/uikit';

import {type YTError} from '../../../../@types/types';
import {OPERATION_TERMINAL_STATES, type OperationPool, type OperationStates} from '../selectors';
import {
    type FormValues as PoolFormValues,
    buildInitialValues,
    getSchedulingOptionsUpdate,
} from './utils';
import {
    type DialogField,
    type DialogTabField,
    type FormApi,
    YTDFDialog,
    makeErrorFields,
} from '../../../containers/Dialog';
import {patchOperationSpec} from '../../../store/actions/operations/helpers/patchOperationSpec';
import {updateOperationAttributes} from '../../../store/actions/operations/helpers/updateOperationAttributes';
import {useGetOperationQuery} from '../../../store/api/yt';
import {showErrorPopup} from '../../../utils/utils';
import {operationSpecPatchToItems} from '../../../utils/operations/specification-patch';
import {
    type EditOperationData,
    type OperationEditAttributes,
    prepareEditOperationData,
} from '../../../utils/operations/edit-operation';
import {
    type SpecificationPatchFormValues,
    getSpecificationPatchFromFormValues,
    getSpecificationPatchInitialValues,
    getSpecificationPatchTaskNames,
    makeSpecificationPatchFields,
} from './SpecificationForm';

import i18n from './i18n';
import {validateNumber} from '../../../common/hammer/validate-number';
import {YTApiId} from '../../../rum/rum-wrap-api';

type Props = {
    operationId: string;
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void | Promise<void>;
};

type FormValues = Record<string, PoolFormValues[string] | SpecificationPatchFormValues> & {
    specification: SpecificationPatchFormValues;
};

const SPECIFICATION_TAB = 'specification';
const OPERATION_EDIT_ATTRIBUTES = [
    'id',
    'state',
    'full_spec',
    'cumulative_spec_patch',
    'runtime_parameters',
] as const;

function makePoolTreeTabs(
    pools: OperationPool[],
    isTerminal: boolean,
    errors: Array<YTError | Error | undefined>,
) {
    return pools.map((item) => {
        const tree = item.tree;

        return {
            type: 'tab-vertical' as const,
            name: tree,
            title: tree,
            fields: [
                {
                    section: i18n('section_general'),
                    fields: [
                        {
                            type: 'plain' as const,
                            name: 'tree',
                            caption: i18n('field_tree'),
                        },
                        {
                            name: 'pool',
                            type: 'text' as const,
                            caption: i18n('field_pool'),
                            extras: {disabled: isTerminal},
                        },
                        {
                            name: 'weight',
                            type: 'number' as const,
                            caption: i18n('field_weight'),
                            extras: {
                                min: 0,
                                hidePrettyValue: true,
                                disabled: isTerminal,
                                formatFn: (value: number | undefined) =>
                                    value === undefined ? '' : String(value),
                            },
                        },
                    ],
                },
                {
                    section: i18n('section_resource-limits'),
                    fields: [
                        {
                            name: 'cpu',
                            type: 'number' as const,
                            caption: i18n('field_cpu'),
                            extras: {
                                min: 0,
                                hidePrettyValue: true,
                                disabled: isTerminal,
                                decimalPlaces: 2,
                            },
                        },
                        {
                            name: 'gpu',
                            type: 'number' as const,
                            caption: i18n('field_gpu'),
                            extras: {
                                min: 0,
                                hidePrettyValue: true,
                                disabled: isTerminal,
                                decimalPlaces: 2,
                            },
                        },
                        {
                            name: 'memory',
                            type: 'bytes' as const,
                            caption: i18n('field_memory'),
                            extras: {disabled: isTerminal},
                            validator: (value: number | undefined) => {
                                if (!value) {
                                    return undefined;
                                }
                                return validateNumber({ge: 0}, value);
                            },
                        },
                        {
                            name: 'user_slots',
                            type: 'number' as const,
                            caption: i18n('field_user-slots'),
                            extras: {
                                min: 0,
                                hidePrettyValue: true,
                                disabled: isTerminal,
                                decimalPlaces: 2,
                            },
                        },
                    ],
                },
                ...makeErrorFields(errors),
            ],
        };
    });
}

function getPoolValues(values: FormValues, pools: OperationPool[]): PoolFormValues {
    const result: PoolFormValues = {};

    for (const pool of pools) {
        const valuesForTree = values[pool.tree] as PoolFormValues[string] | undefined;

        if (valuesForTree) {
            result[pool.tree] = valuesForTree;
        }
    }

    return result;
}

function prepareChanges(values: FormValues, operation: EditOperationData, taskNames: string[]) {
    const specificationPatch = operationSpecPatchToItems(
        getSpecificationPatchFromFormValues(values.specification, taskNames),
    );
    const schedulingOptions = getSchedulingOptionsUpdate(
        getPoolValues(values, operation.pools),
        operation,
    );

    return {specificationPatch, schedulingOptions};
}

function hasChanges(values: FormValues, operation: EditOperationData, taskNames: string[]) {
    try {
        const {specificationPatch, schedulingOptions} = prepareChanges(
            values,
            operation,
            taskNames,
        );
        return specificationPatch.length > 0 || Object.keys(schedulingOptions).length > 0;
    } catch {
        return false;
    }
}

export function EditOperationDialog({operationId, visible, onClose, onSuccess}: Props) {
    const [submitErrors, setSubmitErrors] = useState<Array<YTError | Error>>([]);
    const {
        data: operationAttributes,
        error: loadError,
        isLoading,
        isFetching,
    } = useGetOperationQuery<OperationEditAttributes>(
        {
            id: YTApiId.operationEditData,
            parameters: {
                operation_id: operationId,
                attributes: [...OPERATION_EDIT_ATTRIBUTES],
            },
        },
        {refetchOnMountOrArgChange: true},
    );
    const loading = isLoading || isFetching;
    const operation = useMemo(
        () =>
            !loading && !loadError && operationAttributes
                ? prepareEditOperationData(operationAttributes)
                : undefined,
        [loadError, loading, operationAttributes],
    );

    const isTerminal = operation
        ? OPERATION_TERMINAL_STATES.has(operation.state as OperationStates)
        : false;

    const {pools, initialValues, taskNames} = useMemo(() => {
        const operationPools = operation?.pools ?? [];
        return {
            pools: operationPools,
            initialValues: {
                specification: getSpecificationPatchInitialValues(),
                ...buildInitialValues(operationPools),
            },
            taskNames: getSpecificationPatchTaskNames(operation?.resultingSpec),
        };
    }, [operation]);

    const handleAdd = async (form: FormApi<FormValues>) => {
        if (!operation) {
            return;
        }

        setSubmitErrors([]);

        const {values} = form.getState();
        const {specificationPatch, schedulingOptions} = prepareChanges(
            values,
            operation,
            taskNames,
        );
        const mutations: Array<Promise<void>> = [];

        if (specificationPatch.length > 0) {
            mutations.push(patchOperationSpec(operation.id, specificationPatch));
        }

        if (Object.keys(schedulingOptions).length > 0) {
            mutations.push(updateOperationAttributes(operation.id, schedulingOptions));
        }

        const results = await Promise.allSettled(mutations);
        const errors = results.flatMap((result) =>
            result.status === 'rejected' ? [result.reason as YTError | Error] : [],
        );

        if (errors.length) {
            setSubmitErrors(errors);
            throw errors[0];
        }

        try {
            await onSuccess?.();
        } catch (error) {
            showErrorPopup(error as YTError);
        }
    };

    if (!visible) {
        return null;
    }

    const errors = [loadError, ...submitErrors];
    const fields = [
        {
            type: 'tab-vertical' as const,
            name: SPECIFICATION_TAB,
            title: i18n('tab_specification'),
            fields: [
                ...(operation
                    ? makeSpecificationPatchFields(operation.resultingSpec, isTerminal)
                    : []),
                ...makeErrorFields(errors),
            ],
        },
        ...makePoolTreeTabs(pools, isTerminal, errors),
    ] as unknown as Array<DialogTabField<DialogField<FormValues>>>;

    return (
        <YTDFDialog<FormValues>
            key={operation?.id ?? 'loading'}
            size="l"
            visible={visible}
            onClose={onClose}
            onAdd={handleAdd}
            initialValues={initialValues}
            headerProps={{title: i18n('title_edit-operation')}}
            footerProps={{
                textApply: i18n('action_save'),
            }}
            isApplyDisabled={(state) =>
                !operation ||
                loading ||
                isTerminal ||
                state.hasValidationErrors ||
                !hasChanges(state.values, operation, taskNames)
            }
            waitingMessage={loading ? <Loader size="s" /> : undefined}
            fields={fields}
            modal
        />
    );
}
