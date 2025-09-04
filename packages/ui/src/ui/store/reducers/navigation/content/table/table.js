import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import {UPDATE_PATH, UPDATE_VIEW} from '../../../../../constants/navigation';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import {
    CHANGE_CELL_SIZE,
    CHANGE_PAGE_SIZE,
    CLOSE_COLUMN_SELECTOR_MODAL,
    CLOSE_OFFSET_SELECTOR_MODAL,
    GET_TABLE_DATA,
    MOVE_OFFSET,
    OPEN_COLUMN_SELECTOR_MODAL,
    OPEN_OFFSET_SELECTOR_MODAL,
    SET_COLUMNS,
    SET_COLUMNS_ORDER,
    SET_OFFSET,
    SET_TABLE_COLUMNS_PRESET,
    SET_TABLE_COLUMNS_PRESET_HASH,
    TOGGLE_FULL_SCREEN,
} from '../../../../../constants/navigation/content/table';

const ephemeralState = {
    /** @type {boolean} */
    loading: false,
    /** @type {boolean} */
    loaded: false,
    error: false,
    errorData: {},

    /** @type {Array<{name: string; checked: boolean; keyColumn: boolean; sortOrder: 'ascending' | 'descending'}>} */
    columns: [],
    /** @type Array<string> */
    columnsOrder: [],
    /** @type {Array<string>} */
    omittedColumns: [],
    deniedKeyColumns: [],
    /** @type {import('../../../../../store/actions/navigation/content/table/readTable').ReadTableResult['rows']} */
    rows: [],
    /** @type {import('../../../../../store/actions/navigation/content/table/readTable').ReadTableResult['yqlTypes'] | null} */
    yqlTypes: null,
    isOffsetSelectorOpen: false,
    isColumnSelectorOpen: false,
    isFullScreen: false,

    nextOffsetValue: null,
    moveBackward: false,

    // yql-kit
    validColumns: [],
    queryPreparing: false,
};

const persistedState = {
    isDynamic: false,
    isStrict: false,
    /** @type {'row' | 'key'} */
    offsetMode: 'row',
    /** @type {number  | string} */
    offsetValue: '',
    pageSize: undefined,
    cellSize: undefined,
    columnsPresetHash: '',
    columnsPreset: {columns: undefined, hash: undefined, error: undefined},
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_TABLE_COLUMNS_PRESET_HASH: {
            return {
                ...state,
                columnsPresetHash: action.data,
            };
        }

        case SET_TABLE_COLUMNS_PRESET: {
            return {
                ...state,
                columnsPreset: action.data,
            };
        }

        case UPDATE_VIEW.SUCCESS: {
            const {attributes} = action.data;
            const isDynamic = ypath.getValue(attributes, '/dynamic');
            const isStrict = ypath.getValue(attributes, '/schema/@strict');

            const isInitialValue = state.offsetValue === initialState.offsetValue;
            const offsetValue = isInitialValue ? initialState.offsetValue : state.offsetValue;

            return {
                ...state,
                isDynamic,
                offsetValue,
                nextOffsetValue: offsetValue,
                offsetMode: isDynamic ? 'key' : 'row',
                isStrict,
            };
        }

        case UPDATE_PATH: {
            if (!action.data.shouldUpdateContentMode) {
                return state;
            }
            return {...state, ...initialState};
        }

        case GET_TABLE_DATA.REQUEST:
            return {...state, loading: true};

        case GET_TABLE_DATA.SUCCESS: {
            const {rows, yqlTypes} = action.data;

            return {
                ...state,

                rows,
                yqlTypes,

                loaded: true,
                loading: false,
                error: false,
            };
        }

        case GET_TABLE_DATA.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case GET_TABLE_DATA.CANCELLED:
            return {...state, loading: false, loaded: false, error: false};

        case SET_COLUMNS: {
            const {columns, omittedColumns, deniedKeyColumns} = action.data;

            return {...state, columns, omittedColumns, deniedKeyColumns};
        }

        case SET_COLUMNS_ORDER:
            return {...state, columnsOrder: action.data.columnsOrder};

        case SET_OFFSET: {
            const {offsetValue} = action.data;
            return {...state, offsetValue};
        }

        case MOVE_OFFSET: {
            const {offsetValue: nextOffsetValue, moveBackward = false} = action.data;
            const offsetValue = moveBackward ? state.offsetValue : nextOffsetValue;
            return {...state, nextOffsetValue, moveBackward, offsetValue};
        }

        case OPEN_OFFSET_SELECTOR_MODAL:
            return {...state, isOffsetSelectorOpen: true};

        case CLOSE_OFFSET_SELECTOR_MODAL:
            return {...state, isOffsetSelectorOpen: false};

        case CHANGE_CELL_SIZE:
            return {...state, cellSize: action.data.cellSize};

        case CHANGE_PAGE_SIZE:
            return {...state, pageSize: action.data.pageSize};

        case OPEN_COLUMN_SELECTOR_MODAL:
            return {...state, isColumnSelectorOpen: true};

        case CLOSE_COLUMN_SELECTOR_MODAL:
            return {...state, isColumnSelectorOpen: false};

        case TOGGLE_FULL_SCREEN:
            return {...state, isFullScreen: !state.isFullScreen};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
