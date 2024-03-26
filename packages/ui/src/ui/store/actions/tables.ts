import {ThunkAction} from 'redux-thunk';
import {CHANGE_COLUMN_SORT_ORDER, TOGGLE_COLUMN_SORT_ORDER} from '../../constants/tables';
import {
    OrderType,
    calculateNextOrderValue,
    nextSortOrderValue,
    oldSortStateToOrderType,
    orderTypeToOldSortState,
} from '../../utils/sort-helpers';
import {RootState} from '../reducers';

export type ToggleColumnSortOrderParams = {
    columnName: string;
    tableId: keyof RootState['tables'];
    /** The field is ignored when **allowedOrderTypes** is defined */
    withUndefined?: boolean;
    /** When defined **withUndefined** is ignored */
    allowedOrderTypes?: Array<OrderType>;
    selectField?: string;
};

type TablesThunkAction = ThunkAction<any, RootState, any, any>;

export function toggleColumnSortOrder({
    columnName,
    tableId,
    withUndefined,
    allowedOrderTypes,
    selectField,
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

        const newSortInfo = orderTypeToOldSortState(columnName, newOrderType, selectField);

        dispatch({
            type: TOGGLE_COLUMN_SORT_ORDER,
            data: {tableId, sortInfo: newSortInfo},
        });
    };
}

export interface ChangeColumnSortOrderParams {
    columnName: string;
    tableId: string;
    asc?: boolean;
    selectField?: string;
}

export function changeColumnSortOrder({
    columnName,
    tableId,
    asc,
    selectField,
}: ChangeColumnSortOrderParams) {
    return {
        type: CHANGE_COLUMN_SORT_ORDER,
        data: {columnName, tableId, asc, selectField},
    };
}
