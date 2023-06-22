import {LOADING_STATUS} from '../../../constants/index';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {
    CLEAR_TRANSACTION,
    SET_MODE,
    SET_TRANSACTION,
    Tab,
    UPDATE_PATH,
    UPDATE_VIEW,
} from '../../../constants/navigation';

const persistedState = {
    path: '',
    /** @type {typeof Tab[keyof typeof Tab]} */
    mode: Tab.AUTO,
};

const ephemeralState = {
    /** @type {LOADING_STATUS[keyof LOADING_STATUS]} */
    loadState: LOADING_STATUS.UNINITIALIZED,
    transaction: null,
    error: undefined,
    attributes: {},
    isIdmSupported: false,
    remoteDestinationsConfig: undefined,
    remoteDestinationsState: LOADING_STATUS.UNINITIALIZED,
    remoteDestinationsError: undefined,

    isWriteable: false,
    isAccountUsable: false,
    checkPermissionsError: undefined,
};

export const initialState = {
    ...persistedState,
    ...ephemeralState,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_MODE:
            return {...state, mode: action.data};

        case CLEAR_TRANSACTION:
            return {...state, transaction: null};

        case SET_TRANSACTION:
            return {...state, transaction: action.data};

        case UPDATE_PATH: {
            const {path, shouldUpdateContentMode} = action.data;

            return {
                ...state,
                path,
                mode: shouldUpdateContentMode ? Tab.CONTENT : state.mode,
            };
        }

        case UPDATE_VIEW.REQUEST:
            return {...state, loadState: LOADING_STATUS.LOADING};

        case UPDATE_VIEW.CANCELLED:
            return {...state, loadState: LOADING_STATUS.LOADED};

        case UPDATE_VIEW.FAILURE: {
            const {message, details, isIdmSupported} = action.data;
            const error = {message, details};

            return {
                ...state,
                error,
                isIdmSupported,
                loadState: LOADING_STATUS.ERROR,
            };
        }

        case UPDATE_VIEW.SUCCESS: {
            const {
                attributes,
                attributesWithTypes,
                isWriteable,
                isAccountUsable,
                checkPermissionsError,
            } = action.data;
            return {
                ...state,
                loadState: LOADING_STATUS.LOADED,
                error: undefined,
                attributes,
                attributesWithTypes,
                isWriteable,
                isAccountUsable,
                checkPermissionsError,
            };
        }

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
