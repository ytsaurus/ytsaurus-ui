import {TOGGLE_COLUMN_SORT_ORDER, CHANGE_COLUMN_SORT_ORDER} from '../../constants/tables';
import {
    calculateNextOrderValue,
    nextSortOrderValue,
    oldSortStateToOrderType,
    OrderType,
    orderTypeToOldSortState,
} from '../../utils/sort-helpers';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../reducers';

export type ToggleColumnSortOrderParams = {
    columnName: string;
    tableId: keyof RootState['tables'];
    /** The field is ignored when **allowedOrderTypes** is defined */
    withUndefined?: boolean;
    /** When defined **withUndefined** is ignored */
    allowedOrderTypes?: Array<OrderType>;
};

type TablesThunkAction = ThunkAction<any, RootState, any, any>;

export function toggleColumnSortOrder({
    columnName,
    tableId,
    withUndefined,
    allowedOrderTypes,
}: ToggleColumnSortOrderParams): TablesThunkAction {
    return (dispatch, getState) => {
        const {tables} = getState();
        const sortInfo = tables[tableId];

        const orderType = sortInfo.field === columnName ? oldSortStateToOrderType(sortInfo) : '';

        let newOrderType;
        if (allowedOrderTypes?.length) {
            newOrderType = calculateNextOrderValue(orderType, allowedOrderTypes);
        } else {
            newOrderType = nextSortOrderValue(orderType, false, withUndefined);
        }

        const newSortInfo = orderTypeToOldSortState(columnName, newOrderType);

        dispatch({
            type: TOGGLE_COLUMN_SORT_ORDER,
            data: {tableId, sortInfo: newSortInfo},
        });
    };
}

interface ChangeColumnSortOrderParams {
    columnName: string;
    tableId: string;
    asc?: boolean;
}

export function changeColumnSortOrder({columnName, tableId, asc}: ChangeColumnSortOrderParams) {
    return {
        type: CHANGE_COLUMN_SORT_ORDER,
        data: {columnName, tableId, asc},
    };
}
