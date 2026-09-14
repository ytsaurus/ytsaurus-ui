import React from 'react';
import cn from 'bem-cn-lite';

import {CircleInfo} from '@gravity-ui/icons';
import {Icon as UIKitIcon} from '@gravity-ui/uikit';
import {Tooltip} from '@ytsaurus/components';

import Button from '../../../components/Button/Button';
import Icon from '../../../components/Icon/Icon';
import {OPERATION_TERMINAL_STATES, type OperationStates} from '../selectors';
import {EditOperationDialog} from '../EditOperationDialog/EditOperationDialog';
import i18n from '../EditOperationDialog/i18n';
import {useOperationEditorData} from '../EditOperationDialog/useOperationEditorData';

import './EditOperationButton.scss';

const block = cn('edit-operation-button');

export type EditOperationButtonProps = {
    className?: string;
    operationId: string;
    operationState: OperationStates;
    view: 'edit-button' | 'edit-icon';
    onSuccess?: () => void | Promise<void>;
};

export function EditOperationButton({
    className,
    operationId,
    operationState,
    view,
    onSuccess,
}: EditOperationButtonProps) {
    const {operationAttributes, specificationPatchSupported, isFetching, open, close} =
        useOperationEditorData(operationId);
    const editable = !OPERATION_TERMINAL_STATES.has(operationState);
    const label = i18n('title_edit-operation');
    const iconOnly = view === 'edit-icon';

    return (
        <React.Fragment>
            <span className={block({editable}, className)}>
                <Button
                    size={iconOnly ? 's' : 'm'}
                    view={iconOnly ? 'flat-secondary' : 'outlined'}
                    title={label}
                    disabled={!editable || isFetching}
                    loading={isFetching}
                    onClick={open}
                >
                    <Icon awesome="pencil" color="secondary" />
                    {!iconOnly && <React.Fragment>&nbsp;{label}</React.Fragment>}
                </Button>
                {!editable && (
                    <Tooltip content={i18n('context_edit-disabled-terminal-state')}>
                        <span className={block('info')}>
                            <UIKitIcon data={CircleInfo} size={16} />
                        </span>
                    </Tooltip>
                )}
            </span>
            {operationAttributes && (
                <EditOperationDialog
                    operationAttributes={operationAttributes}
                    specificationPatchSupported={specificationPatchSupported}
                    visible
                    onClose={close}
                    onSuccess={onSuccess}
                />
            )}
        </React.Fragment>
    );
}
