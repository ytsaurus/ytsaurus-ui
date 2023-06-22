import {LOCATION_POP, LOCATION_PUSH} from 'redux-location-state/lib/constants';
import {parseParams} from 'redux-location-state/lib/helpers';
import {LOADING_STATUS, MediumType} from '../../../../../constants/index';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import {
    APPLY_CUSTOM_SORT,
    ContentMode,
    FETCH_NODES,
    SELECT_ALL,
    SET_CONTENT_MODE,
    SET_MEDIUM_TYPE,
    SET_SELECTED_ITEM,
    SET_TEXT_FILTER,
    UPDATE_PATH,
    UPDATE_RESOURCE_USAGE,
} from '../../../../../constants/navigation';
import {DELETE_OBJECT} from '../../../../../constants/navigation/modals/delete-object';

const ephemeralState = {
    loadState: LOADING_STATUS.UNINITIALIZED,
    resourcesLoading: false,
    error: undefined,
    nodesData: [],
    lastSelected: undefined,
};

const persistedState = {
    filter: '',
    filterPathname: '',
    customSort: '',
    selected: {},
    mediumType: MediumType.ALL,
    contentMode: ContentMode.DEFAULT,
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case APPLY_CUSTOM_SORT:
            return {...state, customSort: action.data};

        case SET_MEDIUM_TYPE:
            return {...state, mediumType: action.data};

        case FETCH_NODES.REQUEST:
            return {...state, loadState: LOADING_STATUS.LOADING};

        case UPDATE_RESOURCE_USAGE.REQUEST:
            return {...state, resourcesLoading: true};
        case UPDATE_RESOURCE_USAGE.SUCCESS:
            return {
                ...state,
                resourcesLoading: false,
                nodesData: action.data,
            };
        case UPDATE_RESOURCE_USAGE.CANCELLED:
        case UPDATE_RESOURCE_USAGE.FAILURE:
            return {...state, resourcesLoading: false};

        case FETCH_NODES.SUCCESS:
            return {
                ...state,
                loadState: LOADING_STATUS.LOADED,
                error: undefined,
                nodesData: action.data,
            };

        case FETCH_NODES.FAILURE:
            return {
                ...state,
                loadState: LOADING_STATUS.ERROR,
                error: action.data,
            };

        case FETCH_NODES.CANCELLED:
            return {
                ...state,
                loadState: LOADING_STATUS.LOADED,
            };

        case SET_CONTENT_MODE:
            return {...state, contentMode: action.data};

        case SET_SELECTED_ITEM: {
            const {selected, lastSelected} = action.data;

            return {...state, selected, lastSelected};
        }

        case SELECT_ALL:
            return {...state, selected: action.data.selected};

        case SET_TEXT_FILTER:
            return {
                ...state,
                filter: action.data.filter,
                filterPathname: action.data.path,
            };

        case UPDATE_PATH:
            if (!action.data.shouldUpdateContentMode) {
                return state;
            }
            return {...state, filter: ''};
        case LOCATION_PUSH:
        case LOCATION_POP: {
            const {search} = action.payload;
            const {path} = parseParams(search);

            return state.filterPathname === path
                ? state
                : {
                      ...state,
                      filter: '',
                      filterPathname: path,
                      error: undefined,
                      loadState: LOADING_STATUS.UNINITIALIZED,
                      nodesData: [],
                      selected: {},
                      lastSelected: undefined,
                  };
        }

        case DELETE_OBJECT.SUCCESS:
            return {...state, selected: {}};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
