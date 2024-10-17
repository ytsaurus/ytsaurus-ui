import {TOGGLE_COLUMN_SORT_ORDER} from '../../constants/tables';
import {
    OrderType,
    calculateNextOrderValue,
    nextSortOrderValue,
    oldSortStateToOrderType,
    orderTypeToOldSortState,
} from '../../utils/sort-helpers';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../reducers';
import {TablesSortOrderAction, TablesSortOrderState} from '../reducers/tables';

export type ToggleColumnSortOrderParams = {
    columnName: string;
    tableId: keyof RootState['tables'];
    /** The field is ignored when **allowedOrderTypes** is defined */
    withUndefined?: boolean;
    /** The field is ignored when **allowedOrderTypes** is defined */
    allowUnordered?: boolean;
    /** When defined **withUndefined** is ignored */
    allowedOrderTypes?: Array<OrderType>;
};

type TablesThunkAction = ThunkAction<any, RootState, any, any>;

export function toggleColumnSortOrder({
    columnName,
    tableId,
    withUndefined,
    allowUnordered,
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
            newOrderType = nextSortOrderValue(orderType, allowUnordered, withUndefined);
        }

        const newSortInfo = orderTypeToOldSortState(columnName, newOrderType);

        dispatch({
            type: TOGGLE_COLUMN_SORT_ORDER,
            data: {[tableId]: newSortInfo},
        });
    };
}

interface ChangeColumnSortOrderParams<K extends keyof TablesSortOrderState> {
    tableId: K;
    columnName: TablesSortOrderState[K]['field'];
    asc?: boolean;
}

export function changeColumnSortOrder<K extends keyof TablesSortOrderState>({
    tableId,
    columnName,
    asc,
}: ChangeColumnSortOrderParams<K>): TablesSortOrderAction {
    return {
        type: TOGGLE_COLUMN_SORT_ORDER,
        data: {[tableId]: {field: columnName, asc}},
    };
}
