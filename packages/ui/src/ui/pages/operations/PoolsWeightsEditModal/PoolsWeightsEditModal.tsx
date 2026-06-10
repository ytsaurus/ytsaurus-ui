import cn from 'bem-cn-lite';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {type RootState} from '../../../store/reducers';
import {hideEditPoolsWeightsModal} from '../../../store/actions/operations';
import {OPERATION_TERMINAL_STATES, type OperationStates} from '../selectors';
import {type FormValues, buildInitialValues} from './utils';
import {useSubmitHandler} from './useSubmitHandler';
import {YTDFDialog} from '../../../containers/Dialog';

import i18n from './i18n';
import './PoolsWeightsEditModal.scss';
import {validateNumber} from '../../../common/hammer/validate-number';

const block = cn('operation-pools-weights');

export function PoolsWeightsEditModal() {
    const dispatch = useDispatch();

    const {visible, editable, loading, operation} = useSelector(
        (state: RootState) => state.operations.page.editWeightModal,
    );

    const isTerminal = OPERATION_TERMINAL_STATES.has(operation.state as OperationStates);
    const operationValue = operation.$value;

    const {pools, initialValues} = useMemo(() => {
        const pools = operation.pools ?? [];
        return {pools, initialValues: buildInitialValues(pools)};
    }, [operation.pools]);

    const [activeTab, setActiveTab] = useState<string>('');

    useEffect(() => {
        if (pools.length > 0 && !activeTab) {
            setActiveTab(pools[0].tree);
        }
    }, [pools]);

    const onClose = useCallback(() => {
        dispatch(hideEditPoolsWeightsModal());
    }, [dispatch]);

    const handleAdd = useSubmitHandler(operation, pools);

    if (!visible || !pools.length) {
        return null;
    }

    const dialogTitle = <span>{i18n('title_edit-operation-pools')}</span>;

    return (
        <YTDFDialog<FormValues>
            key={operationValue}
            size="l"
            className={block()}
            visible={visible}
            onClose={onClose}
            onAdd={handleAdd}
            onActiveTabChange={setActiveTab}
            initialValues={initialValues}
            headerProps={{title: dialogTitle}}
            footerProps={{
                textApply: i18n('action_save'),
            }}
            isApplyDisabled={(state) =>
                !editable || loading || isTerminal || state.hasValidationErrors || !state.dirty
            }
            fields={pools.map((item) => {
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
                                    extras: {
                                        disabled: !editable,
                                    },
                                },
                                {
                                    name: 'weight',
                                    type: 'number' as const,
                                    caption: i18n('field_weight'),
                                    extras: {
                                        min: 0,
                                        hidePrettyValue: true,
                                        disabled: !editable,
                                        decimalPlaces: 2,
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
                                        disabled: !editable,
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
                                        disabled: !editable,
                                        decimalPlaces: 2,
                                    },
                                },
                                {
                                    name: 'memory',
                                    type: 'bytes' as const,
                                    caption: i18n('field_memory'),
                                    extras: {
                                        disabled: !editable,
                                    },
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
                                        disabled: !editable,
                                        decimalPlaces: 2,
                                    },
                                },
                            ],
                        },
                    ],
                };
            })}
            modal
        />
    );
}
