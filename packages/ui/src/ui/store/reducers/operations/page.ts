import {type Action} from 'redux';

import {OPERATIONS_STATUS} from '../../../constants/operations';

type OperationsPageState = {
    status: string;
    error: Record<string, unknown>;
};

const initialState: OperationsPageState = {
    status: OPERATIONS_STATUS.LOADING,
    error: {},
};

export function operationsPageReducer(
    state: OperationsPageState = initialState,
    _action: Action,
): OperationsPageState {
    return state;
}
