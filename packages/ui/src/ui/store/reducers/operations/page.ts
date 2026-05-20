import {type Action} from 'redux';

import {
    CHECK_OPERATION_PERMISSIONS,
    HIDE_EDIT_WEIGHT_POOL_MODAL,
    OPERATIONS_STATUS,
    SET_POOLS_AND_WEIGHTS,
    SHOW_EDIT_WEIGHT_POOL_MODAL,
} from '../../../constants/operations';
import {type ActionD, type YTError} from '../../../types';
import {type OperationPool} from '../../../pages/operations/selectors';

type OperationLike = {
    $value: string;
    title?: string;
    state?: string;
    pools: Array<OperationPool>;
};

type EditWeightModalState = {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData?: YTError;
    editable: boolean;
    visible: boolean;
    operation: Partial<OperationLike>;
    hasWritePermission?: boolean;
    checkPermError?: YTError;
    permissionLoading: boolean;
};

type OperationsPageState = {
    status: string;
    error: Record<string, unknown>;
    editWeightModal: EditWeightModalState;
};

const initialState: OperationsPageState = {
    status: OPERATIONS_STATUS.LOADING,
    error: {},
    editWeightModal: {
        loading: false,
        loaded: false,
        error: false,
        errorData: undefined,
        editable: true,
        visible: false,
        operation: {},
        hasWritePermission: undefined,
        checkPermError: undefined,
        permissionLoading: false,
    },
};

type ShowAction = ActionD<
    typeof SHOW_EDIT_WEIGHT_POOL_MODAL,
    {operation: Partial<OperationLike>; editable: boolean}
>;
type HideAction = Action<typeof HIDE_EDIT_WEIGHT_POOL_MODAL>;
type SetRequestAction = Action<typeof SET_POOLS_AND_WEIGHTS.REQUEST>;
type SetSuccessAction = Action<typeof SET_POOLS_AND_WEIGHTS.SUCCESS>;
type SetCancelledAction = Action<typeof SET_POOLS_AND_WEIGHTS.CANCELLED>;
type SetFailureAction = ActionD<typeof SET_POOLS_AND_WEIGHTS.FAILURE, {error: YTError}>;
type CheckRequestAction = Action<typeof CHECK_OPERATION_PERMISSIONS.REQUEST>;
type CheckSuccessAction = ActionD<
    typeof CHECK_OPERATION_PERMISSIONS.SUCCESS,
    {hasWritePermission: boolean}
>;
type CheckFailureAction = ActionD<typeof CHECK_OPERATION_PERMISSIONS.FAILURE, {error: YTError}>;

type OperationsPageAction =
    | ShowAction
    | HideAction
    | SetRequestAction
    | SetSuccessAction
    | SetCancelledAction
    | SetFailureAction
    | CheckRequestAction
    | CheckSuccessAction
    | CheckFailureAction;

export function operationsPageReducer(
    state: OperationsPageState = initialState,
    action: OperationsPageAction,
): OperationsPageState {
    switch (action.type) {
        case SHOW_EDIT_WEIGHT_POOL_MODAL: {
            const {operation, editable} = action.data;
            return {
                ...state,
                editWeightModal: {
                    ...initialState.editWeightModal,
                    visible: true,
                    editable,
                    operation,
                },
            };
        }

        case HIDE_EDIT_WEIGHT_POOL_MODAL:
            return {
                ...state,
                editWeightModal: {...initialState.editWeightModal},
            };

        case SET_POOLS_AND_WEIGHTS.REQUEST:
            return {
                ...state,
                editWeightModal: {
                    ...state.editWeightModal,
                    loading: true,
                },
            };

        case SET_POOLS_AND_WEIGHTS.SUCCESS:
            return {
                ...state,
                editWeightModal: {
                    ...state.editWeightModal,
                    loading: false,
                    loaded: true,
                    error: false,
                    errorData: undefined,
                },
            };

        case SET_POOLS_AND_WEIGHTS.FAILURE:
            return {
                ...state,
                editWeightModal: {
                    ...state.editWeightModal,
                    loading: false,
                    error: true,
                    errorData: action.data.error,
                },
            };

        case SET_POOLS_AND_WEIGHTS.CANCELLED:
            return {
                ...state,
                editWeightModal: {
                    ...state.editWeightModal,
                    loading: false,
                },
            };

        case CHECK_OPERATION_PERMISSIONS.REQUEST:
            return {
                ...state,
                editWeightModal: {
                    ...state.editWeightModal,
                    permissionLoading: true,
                    checkPermError: undefined,
                },
            };

        case CHECK_OPERATION_PERMISSIONS.SUCCESS:
            return {
                ...state,
                editWeightModal: {
                    ...state.editWeightModal,
                    permissionLoading: false,
                    hasWritePermission: action.data.hasWritePermission,
                },
            };

        case CHECK_OPERATION_PERMISSIONS.FAILURE:
            return {
                ...state,
                editWeightModal: {
                    ...state.editWeightModal,
                    permissionLoading: false,
                    checkPermError: action.data.error,
                },
            };

        default:
            return state;
    }
}