import ypath from '../../../../../common/thor/ypath';

import Query from '../../../../../utils/navigation/content/table/query';
import {updateTableData} from '../../../../../store/actions/navigation/content/table/table';
import {
    CLOSE_OFFSET_SELECTOR_MODAL,
    MOVE_OFFSET,
    OPEN_OFFSET_SELECTOR_MODAL,
} from '../../../../../constants/navigation/content/table';
import {
    getBottomBoundKey,
    getOffsetValue,
    getRowCount,
    getUpperBoundKey,
} from '../../../../../store/selectors/navigation/content/table';
import {
    getIsDynamic,
    getPageSize,
    getYqlTypes,
} from '../../../../../store/selectors/navigation/content/table-ts';
import {getAttributes} from '../../../../../store/selectors/navigation';

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
        const yqlTypes = getYqlTypes(state);
        const isDynamic = getIsDynamic(state);
        const attributes = getAttributes(state);
        const isUnmounted = ypath.getValue(attributes, '/tablet_state') === 'unmounted';

        if (isDynamic && !isUnmounted) {
            dispatch({
                type: MOVE_OFFSET,
                data: {
                    offsetValue: Query.prepareKey(getBottomBoundKey(state), yqlTypes),
                    moveBackward: true,
                },
            });
        } else {
            const pageSize = getPageSize(state);
            const offsetValue = getOffsetValue(state);

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
        const yqlTypes = getYqlTypes(state);
        const isDynamic = getIsDynamic(state);

        if (isDynamic) {
            dispatch({
                type: MOVE_OFFSET,
                data: {
                    offsetValue: Query.prepareKey(getUpperBoundKey(state), yqlTypes),
                },
            });
        } else {
            const pageSize = getPageSize(state);
            const offsetValue = getOffsetValue(state);
            const rowCount = getRowCount(state);

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
        const rowCount = getRowCount(state);
        const isDynamic = getIsDynamic(state);
        const pageSize = getPageSize(state);

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
        const prevOffsetValue = getOffsetValue(state);

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
