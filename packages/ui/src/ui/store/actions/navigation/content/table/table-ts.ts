import {Action} from 'redux';
import {ThunkAction} from 'redux-thunk';

import {RootState} from '../../../../../store/reducers';
import {GET_TABLE_DATA} from '../../../../../constants/navigation/content/table';
import {getRows, getYqlTypes} from '../../../../../store/selectors/navigation/content/table-ts';
import {getOffsetValue} from '../../../../../store/selectors/navigation/content/table';

import {ReadTableResult} from './readTable';

export type InjectCellThunk = ThunkAction<void, RootState, unknown, Action>;

export function injectTableCellData({
    data,
    offsetValue,
    columnName,
    rowIndex,
}: {
    data: ReadTableResult;
    offsetValue: unknown;
    columnName: string;
    rowIndex: number;
}): InjectCellThunk {
    return (dispatch, getState) => {
        const state = getState();
        const currentOffset = getOffsetValue(state);
        if (offsetValue !== currentOffset) {
            return;
        }

        const cellData = data.rows[0][columnName];

        const yqlTypes = getYqlTypes(state);
        const rows = [...getRows(state)];

        const rowData = {...rows[rowIndex]};
        Object.assign(rowData, {[columnName]: cellData});
        rows[rowIndex] = rowData;

        dispatch({type: GET_TABLE_DATA.SUCCESS, data: {rows, yqlTypes}});
    };
}
