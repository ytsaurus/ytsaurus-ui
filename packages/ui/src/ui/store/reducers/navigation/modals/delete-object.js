import {
    CLOSE_DELETE_OBJECT_POPUP,
    DELETE_OBJECT,
    LOAD_REAL_PATH,
    OPEN_DELETE_OBJECT_POPUP,
    TOGGLE_PERMANENTLY_DELETE,
} from '../../../../constants/navigation/modals/delete-object';

export const initialState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},

    loadingRealPath: false,
    errorRealPath: false,
    errorDataRealPath: {},

    realPath: '',
    account: '',
    name: '',
    resourceUsage: {},
    visible: false,
    permanently: false,
    inObject: false,
    multipleMode: false,
    multipleInfo: [],
    item: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case OPEN_DELETE_OBJECT_POPUP: {
            const {item, inTrash, inObject, multipleMode} = action.data;

            return {
                ...state,
                item,
                inObject,
                multipleMode,
                permanently: inTrash,
                visible: true,
            };
        }

        case CLOSE_DELETE_OBJECT_POPUP:
            return {...initialState};

        case LOAD_REAL_PATH.REQUEST:
            return {...state, loadingRealPath: true};

        case LOAD_REAL_PATH.SUCCESS: {
            const {multipleMode} = state;

            if (multipleMode) {
                const {multipleInfo} = action.data;

                return {
                    ...state,
                    loadingRealPath: false,
                    errorRealPath: false,
                    multipleInfo,
                };
            } else {
                const {realPath, name, account, resourceUsage} = action.data;

                return {
                    ...state,
                    loadingRealPath: false,
                    errorRealPath: false,
                    realPath,
                    name,
                    account,
                    resourceUsage,
                };
            }
        }

        case LOAD_REAL_PATH.FAILURE:
            return {
                ...state,
                loadingRealPath: false,
                errorRealPath: true,
                errorDataRealPath: action.data.error,
            };

        case TOGGLE_PERMANENTLY_DELETE:
            return {...state, permanently: !state.permanently};

        case DELETE_OBJECT.REQUEST:
            return {...state, loading: true};

        case DELETE_OBJECT.SUCCESS:
            return {...state, loading: false, loaded: true, error: false};

        case DELETE_OBJECT.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        default:
            return state;
    }
};
