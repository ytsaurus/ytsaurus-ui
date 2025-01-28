import {Action} from 'redux/dist/redux';
import {
    CLOSE_DELETE_OBJECT_POPUP,
    DELETE_OBJECT,
    LOAD_REAL_PATH,
    OPEN_DELETE_OBJECT_POPUP,
    TOGGLE_PERMANENTLY_DELETE,
} from '../../../../constants/navigation/modals/delete-object';
import type {ActionD, YTError} from '../../../../types';

type DeleteObjectItem = any;

type MulipleInfoItem = any;

type ResourceUsage = any;

type DeleteObjectState = {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: any;

    loadingRealPath: boolean;
    errorRealPath: boolean;
    errorDataRealPath: any;

    realPath: string;
    account: string;
    name: string;
    resourceUsage: ResourceUsage;
    visible: boolean;
    permanently: boolean;
    multipleMode: boolean;
    multipleInfo: MulipleInfoItem[];
    item: DeleteObjectItem;
};

export const initialState: DeleteObjectState = {
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
    multipleMode: false,
    multipleInfo: [],
    item: {},
};

export default (state = initialState, action: DeleteObjectAction): DeleteObjectState => {
    switch (action.type) {
        case OPEN_DELETE_OBJECT_POPUP: {
            const {item, inTrash, multipleMode} = action.data;

            return {
                ...state,
                item,
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

type DeleteObjectAction =
    | ActionD<
          typeof OPEN_DELETE_OBJECT_POPUP,
          {
              item: DeleteObjectItem;
              inTrash: boolean;
              multipleMode: boolean;
          }
      >
    | Action<typeof CLOSE_DELETE_OBJECT_POPUP>
    | Action<typeof LOAD_REAL_PATH.REQUEST>
    | ActionD<
          typeof LOAD_REAL_PATH.SUCCESS,
          {
              multipleInfo: MulipleInfoItem;
              realPath: string;
              name: string;
              account: string;
              resourceUsage: ResourceUsage;
          }
      >
    | ActionD<
          typeof LOAD_REAL_PATH.FAILURE,
          {
              error: YTError;
          }
      >
    | Action<typeof TOGGLE_PERMANENTLY_DELETE>
    | Action<typeof DELETE_OBJECT.REQUEST>
    | Action<typeof DELETE_OBJECT.SUCCESS>
    | ActionD<typeof DELETE_OBJECT.FAILURE, {error: YTError}>;
