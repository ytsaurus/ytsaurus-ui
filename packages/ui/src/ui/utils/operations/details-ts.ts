import {DetailedOperationSelector} from '../../pages/operations/selectors';
import ypath from '../../common/thor/ypath';
import {PLEASE_PROCEED_TEXT} from '../../utils/actions';
import {IconName} from '../../components/Icon/Icon';

export interface OperationAction {
    modalKey: string;
    name: string;
    successMessage: string;
    icon: IconName;
    message?: string;
    confirmationText?: string;
    details?: string;
    theme?: 'action';
    optionMessage?: string;
    optionValue?: string;
    optionType?: 'radio';
    options?: Array<{
        data?: any;
        text: string;
        value: string;
    }>;
}

export function prepareActions(operation: DetailedOperationSelector) {
    const actions: Array<OperationAction> = [];
    const suspended = ypath.getBoolean(operation, '/@suspended');
    const state = operation.state;

    if (state !== 'completed' && state !== 'failed' && state !== 'aborted') {
        actions.push({
            modalKey: 'abort',
            name: 'abort',
            successMessage: 'Operation was successfully aborted',
            icon: 'stop-circle',
            message:
                "Operation will be aborted with all running jobs, this will cause losing some jobs' data. Are you sure you want to proceed?",
            confirmationText: PLEASE_PROCEED_TEXT,
        });
    }

    if (state === 'running') {
        actions.push({
            modalKey: 'complete',
            name: 'complete',
            successMessage: 'Operation was successfully completed',
            icon: 'check-circle',
            message:
                "Operation will be immediately completed. Running jobs will be aborted, this will cause losing some jobs' data. Are you sure you want to proceed?",
            confirmationText: PLEASE_PROCEED_TEXT,
        });

        if (suspended) {
            actions.push({
                modalKey: 'resume',
                name: 'resume',
                details: 'Operation will be resumed.',
                successMessage: 'Operation was successfully resumed',
                icon: 'play-circle',
                theme: 'action',
            });
        } else {
            actions.push({
                modalKey: 'suspend',
                name: 'suspend',
                details: 'Operation will be suspended.',
                successMessage: 'Operation was successfully suspended',
                icon: 'pause-circle',
                optionMessage: 'Running jobs strategy',
                optionValue: 'abort',
                optionType: 'radio',
                options: [
                    {
                        data: {
                            parameters: {abort_running_jobs: true},
                        },
                        value: 'abort',
                        text: 'Abort running jobs',
                    },
                    {
                        data: {
                            parameters: {},
                        },
                        value: 'retain',
                        text: 'Retain running jobs',
                    },
                ],
            });
        }
    }

    return actions;
}
