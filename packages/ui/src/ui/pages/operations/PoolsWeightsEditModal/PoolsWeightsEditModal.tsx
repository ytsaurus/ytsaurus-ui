import cn from 'bem-cn-lite';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {YTDFDialog} from '../../../components/Dialog';
import {Tooltip} from '@ytsaurus/components';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {type RootState} from '../../../store/reducers';
import {
    checkOperationPermissions,
    hideEditPoolsWeightsModal,
    setPoolsAndWeights,
} from '../../../store/actions/operations';
import {OPERATION_TERMINAL_STATES} from '../selectors';
import {selectCurrentUserName} from '../../../store/selectors/global';
import {type FormValues, buildInitialValues, submitTreeWithToaster} from './utils';
import {usePoolTabs} from './usePoolTabs';

import './PoolsWeightsEditModal.scss';
import i18n from './i18n';

const block = cn('operation-pools-weights');

export function PoolsWeightsEditModal() {
    const dispatch = useDispatch();

    const {
        visible,
        editable,
        loading,
        operation,
        hasWritePermission,
        permissionLoading,
        checkPermError,
    } = useSelector((state: RootState) => state.operations.page.editWeightModal);

    const user = useSelector(selectCurrentUserName);

    const showPermissionWarning = hasWritePermission === false;

    const isTerminal = OPERATION_TERMINAL_STATES.has(
        operation.state as Parameters<typeof OPERATION_TERMINAL_STATES.has>[0],
    );
    const operationValue = operation.$value;

    useEffect(() => {
        if (!visible || !operationValue) {
            return;
        }
        dispatch(checkOperationPermissions(operation, user));
    }, [visible, operationValue, user, dispatch, operation]);

    const {pools, initialValues} = useMemo(() => {
        const poolList = operation.pools ?? [];
        return {pools: poolList, initialValues: buildInitialValues(poolList)};
    }, [operation.pools]);

    const [activeTab, setActiveTab] = useState<string>(pools[0]?.tree || '');
    const [savingTree, setSavingTree] = useState<string | null>(null);
    const [errorByTree, setErrorByTree] = useState<Record<string, unknown>>({});

    const onClose = useCallback(() => {
        dispatch(hideEditPoolsWeightsModal());
    }, [dispatch]);

    const poolTabs = usePoolTabs({
        pools,
        editable,
        showPermissionWarning,
        errorByTree,
        checkPermError,
    });

    if (!visible || !pools.length) {
        return null;
    }

    const titlePrefix = i18n('title_edit-operation-pools');
    const headerTitleSuffix = operation.title || operationValue;
    const dialogTitle = headerTitleSuffix ? (
        <div className={block('title')}>
            <div>{titlePrefix}</div>
            <Tooltip placement={'bottom'} content={headerTitleSuffix}>
                <span className={block('title-suffix')}>{headerTitleSuffix}</span>
            </Tooltip>
        </div>
    ) : (
        titlePrefix
    );

    const saveButtonDisabled = !editable || loading || isTerminal || permissionLoading;

    return (
        <YTDFDialog<FormValues>
            key={operationValue}
            size="l"
            className={block()}
            visible={visible}
            onClose={onClose}
            onAdd={async (form) => {
                const {values} = form.getState();
                setSavingTree(activeTab);
                setErrorByTree((prev) => ({...prev, [activeTab]: null}));
                try {
                    await submitTreeWithToaster(
                        activeTab,
                        values,
                        operation,
                        dispatch,
                        setPoolsAndWeights,
                        (err) => setErrorByTree((prev) => ({...prev, [activeTab]: err})),
                    );
                } finally {
                    setSavingTree(null);
                }
            }}
            onActiveTabChange={setActiveTab}
            initialValues={initialValues}
            headerProps={{title: dialogTitle}}
            footerProps={{
                textApply: i18n('action_save-tab'),
            }}
            isApplyDisabled={(state) => {
                const isPristine = !state.dirty;
                return (
                    saveButtonDisabled ||
                    state.hasValidationErrors ||
                    savingTree === activeTab ||
                    isPristine
                );
            }}
            fields={poolTabs}
            modal
        />
    );
}
