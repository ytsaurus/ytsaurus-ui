import React from 'react';

import {ActionDialog, type FormValues} from '../../../components/ActionDialog/ActionDialog';
import {type OperationAction, performAction} from '../../../utils/operations/detail';
import {type DetailedOperationSelector} from '../selectors';

interface Props {
    action: OperationAction;
    operation: DetailedOperationSelector;
    message: string;
    onSuccess: () => unknown;
    onClose: () => void;
}

export function OperationActionDialog({action, operation, message, onSuccess, onClose}: Props) {
    const handleConfirm = async ({runningJobsStrategy}: FormValues) => {
        await performAction({
            name: action.name,
            operation,
            runningJobsStrategy,
            successMessage: action.successMessage,
        });
        await onSuccess();
    };

    return (
        <ActionDialog
            message={
                <>
                    <p>{message}</p>
                    <p className="elements-secondary-text">{action.details}</p>
                </>
            }
            requireConfirmation={action.requireConfirmation}
            showRunningJobsStrategy={action.name === 'suspend'}
            onConfirm={handleConfirm}
            onClose={onClose}
        />
    );
}
