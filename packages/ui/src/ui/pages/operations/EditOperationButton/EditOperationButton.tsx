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

import './EditOperationButton.scss';

const block = cn('edit-operation-button');

export type EditOperationButtonProps = {
    operationId: string;
    operationState: OperationStates;
    view: 'edit-button' | 'edit-icon';
    onSuccess?: () => void | Promise<void>;
};

export function EditOperationButton({
    operationId,
    operationState,
    view,
    onSuccess,
}: EditOperationButtonProps) {
    const [visible, setVisible] = React.useState(false);
    const editable = !OPERATION_TERMINAL_STATES.has(operationState);
    const label = i18n('title_edit-operation');
    const iconOnly = view === 'edit-icon';

    return (
        <React.Fragment>
            <span className={block()}>
                <Button
                    size={iconOnly ? 's' : 'm'}
                    view={iconOnly ? 'flat-secondary' : 'outlined'}
                    title={label}
                    disabled={!editable}
                    onClick={() => setVisible(true)}
                >
                    <Icon awesome="pencil" />
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
            {visible && (
                <EditOperationDialog
                    operationId={operationId}
                    visible
                    onClose={() => setVisible(false)}
                    onSuccess={onSuccess}
                />
            )}
        </React.Fragment>
    );
}
