import Query from '../../../../../utils/navigation/content/table/query';
import {updateTableData} from '../../../../../store/actions/navigation/content/table/table';
import {
    CLOSE_OFFSET_SELECTOR_MODAL,
    MOVE_OFFSET,
    OPEN_OFFSET_SELECTOR_MODAL,
} from '../../../../../constants/navigation/content/table';
import {
    selectBottomBoundKey,
    selectOffsetValue,
    selectRowCount,
    selectUpperBoundKey,
} from '../../../../../store/selectors/navigation/content/table';
import {
    selectIsDynamic,
    selectPageSize,
    selectYqlTypes,
} from '../../../../../store/selectors/navigation/content/table-ts';

export function moveOffsetToStart() {
    return (dispatch) => {
        dispatch({
            type: MOVE_OFFSET,
            data: {
                offsetValue: '',
            },
        });
        dispatch(updateTableData());
    };
}

export function moveOffsetToLeft() {
    return (dispatch, getState) => {
        const state = getState();
        const yqlTypes = selectYqlTypes(state);
        const isDynamic = selectIsDynamic(state);

        if (isDynamic) {
            dispatch({
                type: MOVE_OFFSET,
                data: {
                    offsetValue: Query.prepareKey(selectBottomBoundKey(state), yqlTypes),
                    moveBackward: true,
                },
            });
        } else {
            const pageSize = selectPageSize(state);
            const offsetValue = selectOffsetValue(state);

            dispatch({
                type: MOVE_OFFSET,
                data: {
                    offsetValue: Math.max(offsetValue - pageSize, 0) || '',
                },
            });
        }
        dispatch(updateTableData());
    };
}

export function moveOffsetToRight() {
    return (dispatch, getState) => {
        const state = getState();
        const yqlTypes = selectYqlTypes(state);
        const isDynamic = selectIsDynamic(state);

        if (isDynamic) {
            dispatch({
                type: MOVE_OFFSET,
                data: {
                    offsetValue: Query.prepareKey(selectUpperBoundKey(state), yqlTypes),
                },
            });
        } else {
            const pageSize = selectPageSize(state);
            const offsetValue = selectOffsetValue(state);
            const rowCount = selectRowCount(state);

            dispatch({
                type: MOVE_OFFSET,
                data: {
                    offsetValue: Math.min(offsetValue + pageSize, Math.max(rowCount - pageSize, 0)),
                },
            });
        }
        dispatch(updateTableData());
    };
}

export function moveOffsetToEnd() {
    return (dispatch, getState) => {
        const state = getState();
        const rowCount = selectRowCount(state);
        const isDynamic = selectIsDynamic(state);
        const pageSize = selectPageSize(state);

        if (isDynamic) {
            dispatch({
                type: MOVE_OFFSET,
                data: {
                    offsetValue: '',
                    moveBackward: true,
                },
            });
        } else {
            dispatch({
                type: MOVE_OFFSET,
                data: {
                    offsetValue: Math.max(rowCount - pageSize, 0),
                },
            });
        }
        dispatch(updateTableData());
    };
}

export function moveOffset(offsetValue) {
    return (dispatch, getState) => {
        const state = getState();
        const prevOffsetValue = selectOffsetValue(state);

        if (offsetValue !== prevOffsetValue) {
            dispatch({
                type: MOVE_OFFSET,
                data: {offsetValue: offsetValue || ''},
            });
            dispatch(updateTableData());
        }
    };
}

export function openOffsetSelectorModal() {
    return {
        type: OPEN_OFFSET_SELECTOR_MODAL,
    };
}

export function closeOffsetSelectorModal() {
    return {
        type: CLOSE_OFFSET_SELECTOR_MODAL,
    };
}
