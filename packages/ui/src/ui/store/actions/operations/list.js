import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import moment from 'moment';

import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import ypath from '../../../common/thor/ypath';
import hammer from '../../../common/hammer';
import {
    APPLY_FILTER_PRESET,
    DEFAULT_PRESET_SETTING,
    OPERATIONS_CURSOR_DIRECTION,
    OPERATIONS_DATA_MODE,
    OPERATIONS_PAGE,
    RESET_TIME_RANGE,
    SET_OPERATIONS_DATA_MODE,
    TOGGLE_SAVE_FILTER_PRESET_DIALOG,
    UPDATE_CURSOR,
    UPDATE_FILTER,
    UPDATE_FILTER_COUNTERS,
    UPDATE_OPERATIONS_CANCELLED,
    UPDATE_OPERATIONS_FAILURE,
    UPDATE_OPERATIONS_REQUEST,
    UPDATE_OPERATIONS_SUCCESS,
    UPDATE_SAVE_FILTER_PRESET_DIALOG,
} from '../../../constants/operations';
import {ListOperationSelector} from '../../../pages/operations/selectors';
import {removeSetting, setSetting} from '../../../store/actions/settings';
import {
    getDefaultFromTime,
    getDefaultToTime,
    getListRequestParameters,
} from '../../../store/actions/operations/utils';
import CancelHelper from '../../../utils/cancel-helper';
import {NAMESPACES} from '../../../../shared/constants/settings';
import {RumWrapper, YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {getCluster} from '../../../store/selectors/global';

const cancellableRequests = new CancelHelper();

// selectors
function updateCursor({
    timestamp,
    direction,
    firstPageReached,
    lastPageReached,
    resetLoadingStatus = true,
}) {
    return {
        type: UPDATE_CURSOR,
        data: {
            timestamp,
            direction,
            firstPageReached,
            lastPageReached,
            resetLoadingStatus,
        },
    };
}

export function updatePager(incomplete) {
    return (dispatch, getState) => {
        const direction = getState().operations.list.cursor.direction;

        if (direction === OPERATIONS_CURSOR_DIRECTION.PAST) {
            dispatch(
                updateCursor({
                    lastPageReached: !incomplete,
                    resetLoadingStatus: false,
                }),
            );
        } else if (direction === OPERATIONS_CURSOR_DIRECTION.FUTURE) {
            dispatch(
                updateCursor({
                    firstPageReached: !incomplete,
                    resetLoadingStatus: false,
                }),
            );
        }
    };
}

export function updateOperationsList() {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const parameters = getListRequestParameters(state);

        return dispatch(updateOperationsByParams(cluster, parameters));
    };
}

export function updateOperationsByParams(cluster, parameters) {
    return (dispatch) => {
        dispatch({
            type: UPDATE_OPERATIONS_REQUEST,
        });

        const rumId = new RumWrapper(cluster, RumMeasureTypes.OPERATIONS_LIST);
        return rumId
            .fetch(
                YTApiId.listOperations,
                ytApiV3Id.listOperations(YTApiId.listOperations, {
                    parameters,
                    cancellation: cancellableRequests.removeAllAndSave,
                }),
            )
            .then((response) => {
                const {operations, incomplete, ...counters} = response;

                dispatch(updatePager(incomplete));
                dispatch({
                    type: UPDATE_OPERATIONS_SUCCESS,
                    data: rumId.wrap('parse', () => {
                        return map_(operations, (data) => new ListOperationSelector(data));
                    }),
                });
                dispatch({
                    type: UPDATE_FILTER_COUNTERS,
                    data: counters,
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({
                        type: UPDATE_OPERATIONS_CANCELLED,
                    });
                } else {
                    dispatch({
                        type: UPDATE_OPERATIONS_FAILURE,
                        data: {
                            message: 'Could not load operations.',
                            details: error,
                        },
                    });
                }
            });
    };
}

function resetCursor() {
    return updateCursor({
        timestamp: null,
        direction: OPERATIONS_CURSOR_DIRECTION.PAST,
        firstPageReached: true,
        lastPageReached: false,
    });
}

export function updateFilter(name, value) {
    return (dispatch) => {
        dispatch({
            type: UPDATE_FILTER,
            data: {name, value},
        });
        dispatch(resetCursor());
    };
}

function resetTimeRange() {
    return (dispatch, getState) => {
        const dataMode = getState().operations.list.dataMode;
        const currentTime = moment();

        dispatch({
            type: RESET_TIME_RANGE,
            data: {
                from: getDefaultFromTime(currentTime, dataMode),
                to: getDefaultToTime(currentTime, dataMode),
            },
        });
    };
}

export function showArchiveOperations(from, to) {
    return (dispatch) => {
        dispatch({
            type: SET_OPERATIONS_DATA_MODE,
            data: {dataMode: OPERATIONS_DATA_MODE.ARCHIVE, from, to},
        });
        dispatch(resetCursor());
    };
}

export function showCurrentOperations() {
    return (dispatch) => {
        dispatch({
            type: SET_OPERATIONS_DATA_MODE,
            data: {dataMode: OPERATIONS_DATA_MODE.CURRENT},
        });
        dispatch(resetCursor());
    };
}

export function gotoOperationsPage(where) {
    return (dispatch, getState) => {
        const {dataMode, timeRange, cursor, operations} = getState().operations.list;

        switch (where) {
            case OPERATIONS_PAGE.FIRST:
                dispatch(resetCursor());
                if (dataMode === OPERATIONS_DATA_MODE.CURRENT) {
                    dispatch(resetTimeRange());
                }
                break;

            case OPERATIONS_PAGE.LAST:
                if (dataMode === OPERATIONS_DATA_MODE.CURRENT) {
                    dispatch(resetTimeRange());
                }
                // WARNING fromTime is changed in reset timeRange
                dispatch(
                    updateCursor({
                        timestamp: timeRange.from,
                        direction: OPERATIONS_CURSOR_DIRECTION.FUTURE,
                        firstPageReached: false,
                        lastPageReached: true,
                    }),
                );
                break;

            case OPERATIONS_PAGE.NEXT:
                if (!cursor.lastPageReached) {
                    if (dataMode === OPERATIONS_DATA_MODE.CURRENT) {
                        dispatch(resetTimeRange());
                    }

                    dispatch(
                        updateCursor({
                            timestamp: ypath.getValue(
                                operations[operations.length - 1],
                                '/@start_time',
                            ),
                            direction: OPERATIONS_CURSOR_DIRECTION.PAST,
                            firstPageReached: false,
                        }),
                    );
                }
                break;

            case OPERATIONS_PAGE.PREV:
                if (!cursor.firstPageReached) {
                    if (dataMode === OPERATIONS_DATA_MODE.CURRENT) {
                        dispatch(resetTimeRange());
                    }

                    dispatch(
                        updateCursor({
                            timestamp: ypath.getValue(operations[0], '/@start_time'),
                            direction: OPERATIONS_CURSOR_DIRECTION.FUTURE,
                            lastPageReached: false,
                        }),
                    );
                }
                break;
        }
    };
}

export function applyFilterPreset(preset, reload = true) {
    return (dispatch) => {
        dispatch({
            type: APPLY_FILTER_PRESET,
            data: {preset},
        });

        if (reload) {
            dispatch(resetCursor());
        }
    };
}

export function removeFilterPreset(presetId) {
    return (dispatch) => {
        dispatch(removeSetting(presetId, NAMESPACES.OPERATION_PRESETS));
    };
}

export function toggleSaveFilterPresetDialog() {
    return {
        type: TOGGLE_SAVE_FILTER_PRESET_DIALOG,
    };
}

export function updateSaveFilterPresetDialog({name, value}) {
    return {
        type: UPDATE_SAVE_FILTER_PRESET_DIALOG,
        data: {fieldName: name, fieldValue: value},
    };
}

function selectActualFilters(state) {
    const currentFilters = state.operations.list.filters;
    return reduce_(
        currentFilters,
        (filters, {value}, key) => {
            return {...filters, [key]: value};
        },
        {},
    );
}

export function saveFilterPreset(name, isDefault) {
    return (dispatch, getState) => {
        let promise = Promise.resolve();
        const presetId = hammer.guid();

        if (isDefault) {
            promise = dispatch(setSetting(DEFAULT_PRESET_SETTING, NAMESPACES.OPERATION, presetId));
        }
        return promise.then(() => {
            dispatch(
                setSetting(presetId, NAMESPACES.OPERATION_PRESETS, {
                    name,
                    filters: selectActualFilters(getState()),
                }),
            );
        });
    };
}
