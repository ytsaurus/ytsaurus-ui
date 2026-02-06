import {Action} from 'redux';

import {ValueOf, YTError} from '../../../../@types/types';

import {ActionD} from '../../../types';
import {LOADING_STATUS, LoadingStatus} from '../../../constants/index';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {
    CLEAR_TRANSACTION,
    NAVIGATION_PARTIAL,
    SET_MODE,
    SET_ORIGINATING_QUEUE_PATH,
    SET_TRANSACTION,
    Tab,
    UPDATE_PATH,
    UPDATE_VIEW,
} from '../../../constants/navigation';

export type NavigationState = {
    path: string;
    mode: ValueOf<typeof Tab>;

    loadState: LoadingStatus;
    transaction: string | undefined;

    error: {message: string; details: YTError} | undefined;

    attributesWithTypes: unknown;
    attributes: unknown;
    isIdmSupported: boolean;

    remoteDestinationsConfig: unknown;
    remoteDestinationsState: LoadingStatus;
    remoteDestinationsError: YTError | undefined;

    isWriteable: boolean | undefined;
    isAccountUsable: boolean | undefined;
    checkPermissionsError: YTError | undefined;

    sidePanelMode: 'qt' | 'yqlkit' | undefined;

    originatingQueuePath: string | undefined;

    is_access_log_available: false;
};

const persistedState: Pick<NavigationState, 'path' | 'mode'> = {
    path: '',
    /** @type {typeof Tab[keyof typeof Tab]} */
    mode: Tab.AUTO,
};

const ephemeralState: Omit<NavigationState, keyof typeof persistedState> = {
    /** @type {LOADING_STATUS[keyof LOADING_STATUS]} */
    loadState: LOADING_STATUS.UNINITIALIZED,
    transaction: undefined,
    error: undefined,
    attributes: {},
    attributesWithTypes: {},
    isIdmSupported: false,
    remoteDestinationsConfig: undefined,
    remoteDestinationsState: LOADING_STATUS.UNINITIALIZED,
    remoteDestinationsError: undefined,

    isWriteable: false,
    isAccountUsable: false,
    checkPermissionsError: undefined,

    sidePanelMode: undefined,

    originatingQueuePath: undefined,
    is_access_log_available: false,
};

export const initialState: NavigationState = {
    ...persistedState,
    ...ephemeralState,
};

const reducer = (state = initialState, action: NavigationAction): NavigationState => {
    switch (action.type) {
        case SET_MODE:
            return {...state, mode: action.data};

        case CLEAR_TRANSACTION:
            return {...state, transaction: undefined};

        case SET_TRANSACTION:
            return {...state, transaction: action.data};

        case SET_ORIGINATING_QUEUE_PATH:
            return {...state, originatingQueuePath: action.data};

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
                originatingQueuePath,
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
                originatingQueuePath,
            };
        }

        case NAVIGATION_PARTIAL: {
            return {...state, ...action.data};
        }

        default:
            return state;
    }
};

export type NavigationAction =
    | Action<typeof CLEAR_TRANSACTION | typeof UPDATE_VIEW.REQUEST | typeof UPDATE_VIEW.CANCELLED>
    | ActionD<typeof SET_MODE, NavigationState['mode']>
    | ActionD<typeof SET_TRANSACTION, NavigationState['transaction']>
    | ActionD<typeof SET_ORIGINATING_QUEUE_PATH, NavigationState['originatingQueuePath']>
    | ActionD<typeof UPDATE_PATH, {path: string; shouldUpdateContentMode?: boolean}>
    | ActionD<
          typeof UPDATE_VIEW.FAILURE,
          NavigationState['error'] & Pick<NavigationState, 'isIdmSupported'>
      >
    | ActionD<
          typeof UPDATE_VIEW.SUCCESS,
          Pick<
              Partial<NavigationState>,
              | 'attributes'
              | 'attributesWithTypes'
              | 'isWriteable'
              | 'isAccountUsable'
              | 'checkPermissionsError'
              | 'originatingQueuePath'
          >
      >
    | ActionD<typeof NAVIGATION_PARTIAL, Partial<NavigationState>>;

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
