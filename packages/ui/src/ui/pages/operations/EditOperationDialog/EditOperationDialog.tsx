import React, {useMemo, useState} from 'react';
import cn from 'bem-cn-lite';

import {Loader} from '@gravity-ui/uikit';

import {type YTError} from '../../../../@types/types';
import {validateNumber} from '../../../common/hammer/validate-number';
import {type FormApi, YTDFDialog, makeErrorFields} from '../../../containers/Dialog';
import {YTApiId} from '../../../rum/rum-wrap-api';
import {updateOperationAttributes} from '../../../store/actions/operations/helpers/updateOperationAttributes';
import {useGetOperationQuery} from '../../../store/api/yt';
import {showErrorPopup} from '../../../utils/utils';
import {
    type EditOperationData,
    type OperationEditAttributes,
    prepareEditOperationData,
} from '../../../utils/operations/edit-operation';
import {OPERATION_TERMINAL_STATES, type OperationPool, type OperationStates} from '../selectors';
import {type FormValues, buildInitialValues, getSchedulingOptionsUpdate} from './utils';

import i18n from './i18n';

import './EditOperationDialog.scss';

const block = cn('yt-edit-operation-dialog');

type Props = {
    operationId: string;
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void | Promise<void>;
};

const OPERATION_EDIT_ATTRIBUTES = ['id', 'state', 'runtime_parameters'] as const;

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

function hasChanges(values: FormValues, operation: EditOperationData) {
    return Object.keys(getSchedulingOptionsUpdate(values, operation)).length > 0;
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
    const {pools, initialValues} = useMemo(() => {
        const operationPools = operation?.pools ?? [];
        return {
            pools: operationPools,
            initialValues: buildInitialValues(operationPools),
        };
    }, [operation]);
    const isTerminal = operation
        ? OPERATION_TERMINAL_STATES.has(operation.state as OperationStates)
        : false;

    const handleAdd = async (form: FormApi<FormValues>) => {
        if (!operation) {
            return;
        }

        setSubmitErrors([]);
        const schedulingOptions = getSchedulingOptionsUpdate(form.getState().values, operation);

        try {
            await updateOperationAttributes(operation.id, schedulingOptions);
        } catch (error) {
            setSubmitErrors([error as YTError | Error]);
            throw error;
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

    return (
        <YTDFDialog<FormValues>
            key={operation?.id ?? 'loading'}
            className={block()}
            size="l"
            visible={visible}
            onClose={onClose}
            onAdd={handleAdd}
            initialValues={initialValues}
            headerProps={{title: i18n('title_edit-operation')}}
            footerProps={{textApply: i18n('action_save')}}
            isApplyDisabled={(state) =>
                !operation ||
                loading ||
                isTerminal ||
                state.hasValidationErrors ||
                !hasChanges(state.values, operation)
            }
            waitingMessage={loading ? <Loader size="s" /> : undefined}
            fields={makePoolTreeTabs(pools, isTerminal, errors)}
            modal
        />
    );
}
