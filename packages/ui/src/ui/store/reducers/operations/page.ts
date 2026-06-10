import {
    HIDE_EDIT_WEIGHT_POOL_MODAL,
    OPERATIONS_STATUS,
    SET_PULLS_AND_WEIGHTS,
    SHOW_EDIT_WEIGHT_POOL_MODAL,
} from '../../../constants/operations';

const initialState = {
    status: OPERATIONS_STATUS.LOADING,
    error: {},
    editWeightModal: {
        loading: false,
        loaded: false,
        error: false,
        errorData: {},

        editable: true,
        visible: false,
        operation: {},
    },
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SHOW_EDIT_WEIGHT_POOL_MODAL: {
            const {operation, editable} = action.data;
            return {
                ...state,
                editWeightModal: {
                    ...state.editWeightModal,
                    visible: true,
                    editable,
                    operation,
                },
            };
        }

        case HIDE_EDIT_WEIGHT_POOL_MODAL:
            return {
                ...state,
                editWeightModal: {
                    ...initialState.editWeightModal,
                },
            };

        case SET_PULLS_AND_WEIGHTS.REQUEST: {
            return {
                ...state,
                editWeightModal: {
                    ...state.editWeightModal,
                    loading: true,
                },
            };
        }

        case SET_PULLS_AND_WEIGHTS.SUCCESS: {
            return {
                ...state,
                editWeightModal: {
                    ...state.editWeightModal,
                    loading: false,
                    loaded: true,
                    error: false,
                },
            };
        }

        case SET_PULLS_AND_WEIGHTS.FAILURE: {
            return {
                ...state,
                editWeightModal: {
                    ...state.editWeightModal,
                    loading: false,
                    error: true,
                    errorData: action.data.error,
                },
            };
        }

        case SET_PULLS_AND_WEIGHTS.CANCELLED: {
            return {
                ...state,
                editWeightModal: {
                    ...state.editWeightModal,
                    loading: false,
                },
            };
        }

        default:
            return state;
    }
};
