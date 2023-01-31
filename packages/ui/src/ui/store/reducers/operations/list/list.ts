import _ from 'lodash';

import {
    UPDATE_FILTER,
    UPDATE_FILTER_COUNTERS,
    TEXT_FILTER,
    STATE_FILTER,
    PARAM_FILTER,
    OPERATIONS_DATA_MODE,
    OPERATIONS_CURSOR_DIRECTION,
    UPDATE_CURSOR,
    RESET_TIME_RANGE,
    SET_OPERATIONS_DATA_MODE,
    APPLY_FILTER_PRESET,
    TOGGLE_SAVE_FILTER_PRESET_DIALOG,
    UPDATE_SAVE_FILTER_PRESET_DIALOG,
    UPDATE_OPERATIONS_REQUEST,
    UPDATE_OPERATIONS_SUCCESS,
    UPDATE_OPERATIONS_FAILURE,
    OPERATIONS_LIST_DEFAULT_FILTERS,
} from '../../../../constants/operations';
import {mergeStateOnClusterChange} from '../../../../store/reducers/utils';
import type {ActionD, ValueOf} from '../../../../types';
import {Action} from 'redux';

export interface OperationsListState {
    isLoading: boolean;
    hasLoaded: boolean;
    hasError: boolean;
    error: any;
    dataMode: ValueOf<typeof OPERATIONS_DATA_MODE>;
    operations: Array<unknown>;

    timeRange: {from?: string; to?: string};
    cursor: {
        from: string | null;
        direction: ValueOf<typeof OPERATIONS_CURSOR_DIRECTION>;
        firstPageReached: boolean;
        lastPageReached: boolean;
    };
    filters: Record<
        | 'text'
        | 'subject'
        | 'failedJobs'
        | 'user'
        | 'permissions'
        | 'poolTree'
        | 'pool'
        | 'state'
        | 'type',
        {
            type: typeof TEXT_FILTER | typeof STATE_FILTER | typeof PARAM_FILTER;
            defaultValue: string | boolean | Array<unknown>;
            value: boolean | string | Array<unknown>;
            counters?: Record<string, number>;
            counter?: number;
        }
    >;

    savePresetDialog: {
        isSaving: boolean;
        name: string;
        isDefault: boolean;
    };
    activePreset: string;
}

const ephemeralStateTmp = {
    isLoading: true,
    hasLoaded: false,
    hasError: false,
    error: {},
    dataMode: OPERATIONS_DATA_MODE.CURRENT,
    operations: [],
};

const ephemeralState: Pick<OperationsListState, keyof typeof ephemeralStateTmp> = ephemeralStateTmp;

const persistedState: Omit<OperationsListState, keyof typeof ephemeralState> = {
    timeRange: {
        from: undefined,
        to: undefined,
    },
    cursor: {
        from: null,
        direction: OPERATIONS_CURSOR_DIRECTION.PAST,
        firstPageReached: true,
        lastPageReached: false,
    },
    filters: applyDefaultFilterValues({
        text: {
            type: TEXT_FILTER,
        },
        user: {
            type: STATE_FILTER,
            counters: {},
        },
        subject: {
            type: TEXT_FILTER,
        },
        permissions: {
            type: STATE_FILTER,
        },
        poolTree: {
            type: STATE_FILTER,
            counters: {},
        },
        pool: {
            type: STATE_FILTER,
            counters: {},
        },
        state: {
            type: STATE_FILTER,
            counters: {},
        },
        type: {
            type: STATE_FILTER,
            counters: {},
        },
        failedJobs: {
            type: PARAM_FILTER,
            counter: 0,
        },
    }),
    savePresetDialog: {
        isSaving: false,
        name: '',
        isDefault: false,
    },
    activePreset: '',
};

type FiltersNoValues = {
    [K in keyof OperationsListState['filters']]: Omit<
        OperationsListState['filters'][K],
        'value' | 'defaultValue'
    >;
};

function applyDefaultFilterValues(filters: FiltersNoValues): OperationsListState['filters'] {
    return _.reduce(
        filters,
        (acc, data, k) => {
            const key: keyof typeof filters = k as any;
            acc[key] = {
                ...data,
                value: OPERATIONS_LIST_DEFAULT_FILTERS[key],
                defaultValue: OPERATIONS_LIST_DEFAULT_FILTERS[key],
            };
            return acc;
        },
        {} as OperationsListState['filters'],
    );
}

export const initialState: OperationsListState = {
    ...ephemeralState,
    ...persistedState,
};

function getUpdatedFilter<K extends keyof OperationsListState['filters']>(
    state: OperationsListState,
    filterName: K,
    filterData: Partial<OperationsListState['filters'][K]>,
) {
    const filter = state.filters[filterName];

    return {
        ...state,
        filters: {
            ...state.filters,
            [filterName]: {...filter, ...filterData},
        },
    };
}

function applyFilterPreset(
    state: OperationsListState,
    presets: Partial<OperationsListState['filters']>,
) {
    return _.reduce(
        presets,
        (state, value, name) => getUpdatedFilter(state, name as any, {value}),
        state,
    );
}

function reducer(state = initialState, action: OperationsListStateAction): OperationsListState {
    switch (action.type) {
        case RESET_TIME_RANGE: {
            const {from, to} = action.data;

            return {...state, timeRange: {from, to}};
        }

        case SET_OPERATIONS_DATA_MODE: {
            const {dataMode, from, to} = action.data;

            return dataMode === OPERATIONS_DATA_MODE.ARCHIVE
                ? {...state, dataMode, timeRange: {from, to}}
                : {
                      ...state,
                      dataMode,
                      timeRange: {from: undefined, to: undefined},
                  };
        }

        case UPDATE_CURSOR: {
            const {timestamp, direction, firstPageReached, lastPageReached, resetLoadingStatus} =
                action.data;
            const cursor = {...state.cursor};
            const isLoading = resetLoadingStatus ? true : state.isLoading;
            const hasLoaded = resetLoadingStatus ? false : state.hasLoaded;

            if (typeof timestamp !== 'undefined') {
                cursor.from = timestamp;
            }
            if (direction) {
                cursor.direction = direction;
            }
            if (typeof firstPageReached === 'boolean') {
                cursor.firstPageReached = firstPageReached;
            }
            if (typeof lastPageReached === 'boolean') {
                cursor.lastPageReached = lastPageReached;
            }

            return {...state, cursor, isLoading, hasLoaded};
        }

        case UPDATE_OPERATIONS_REQUEST:
            return {...state, isLoading: true};

        case UPDATE_OPERATIONS_SUCCESS:
            return {
                ...state,
                isLoading: false,
                hasLoaded: true,
                hasError: false,
                operations: action.data,
            };

        case UPDATE_OPERATIONS_FAILURE:
            return {
                ...state,
                isLoading: false,
                hasError: true,
                error: action.data,
            };

        case UPDATE_FILTER: {
            const {name, value} = action.data;

            return getUpdatedFilter(state, name, {value});
        }

        case UPDATE_FILTER_COUNTERS: {
            const counters: any = action.data;
            const filters = _.reduce(
                state.filters,
                (filters, value, name) => {
                    switch (value.type) {
                        case STATE_FILTER:
                            filters[name as keyof typeof filters] = {
                                ...value,
                                counters,
                            };
                            break;
                        case PARAM_FILTER:
                            filters[name as keyof typeof filters] = {
                                ...value,
                                counter: counters.failed_jobs_count,
                            };
                            break;
                        default:
                            filters[name as keyof typeof filters] = value;
                            break;
                    }

                    return filters;
                },
                {} as OperationsListState['filters'],
            );

            return {...state, filters};
        }

        case APPLY_FILTER_PRESET: {
            const {preset} = action.data;

            return {
                ...state,
                ...applyFilterPreset(state, preset.filters),
                activePreset: preset.name,
            };
        }

        case TOGGLE_SAVE_FILTER_PRESET_DIALOG: {
            const dialog = state.savePresetDialog;
            return {
                ...state,
                savePresetDialog: {...dialog, isSaving: !dialog.isSaving},
            };
        }

        case UPDATE_SAVE_FILTER_PRESET_DIALOG: {
            const dialog = state.savePresetDialog;
            const {fieldName, fieldValue} = action.data;

            return {
                ...state,
                savePresetDialog: {...dialog, [fieldName]: fieldValue},
            };
        }

        default:
            return state;
    }
}

export type OperationsListFilterName = keyof OperationsListState['filters'];
export type OperationsListFilterValue = OperationsListState['filters'][OperationsListFilterName];

export type OperationsListStateAction =
    | ActionD<typeof RESET_TIME_RANGE, OperationsListState['timeRange']>
    | ActionD<
          typeof SET_OPERATIONS_DATA_MODE,
          OperationsListState['timeRange'] & Pick<OperationsListState, 'dataMode'>
      >
    | ActionD<
          typeof UPDATE_CURSOR,
          Omit<OperationsListState['cursor'], 'from'> & {
              timestamp?: string;
              resetLoadingStatus: boolean;
          }
      >
    | Action<typeof UPDATE_OPERATIONS_REQUEST>
    | ActionD<typeof UPDATE_OPERATIONS_SUCCESS, Array<unknown>>
    | ActionD<typeof UPDATE_OPERATIONS_FAILURE, OperationsListState['error']>
    | ActionD<
          typeof UPDATE_FILTER,
          {
              name: OperationsListFilterName;
              value: OperationsListFilterValue['value'];
          }
      >
    | ActionD<typeof UPDATE_FILTER_COUNTERS, Record<keyof OperationsListState['filters'], unknown>>
    | ActionD<
          typeof APPLY_FILTER_PRESET,
          {
              preset: {
                  name: string;
                  filters: Partial<OperationsListState['filters']>;
              };
          }
      >
    | ActionD<
          typeof UPDATE_SAVE_FILTER_PRESET_DIALOG,
          {
              fieldName: keyof OperationsListState['savePresetDialog'];
              fieldValue: unknown;
          }
      >
    | Action<typeof TOGGLE_SAVE_FILTER_PRESET_DIALOG>;

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
