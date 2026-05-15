import {type Action} from 'redux';
import {type ThunkAction} from 'redux-thunk';

import {type RootState} from '../../../../../store/reducers';
import {GET_TABLE_DATA} from '../../../../../constants/navigation/content/table';
import {
    selectRows,
    selectYqlTypes,
} from '../../../../../store/selectors/navigation/content/table-ts';
import {selectOffsetValue} from '../../../../../store/selectors/navigation/content/table';

import {type ReadTableResult} from './readTable';

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
        const currentOffset = selectOffsetValue(state);
        if (offsetValue !== currentOffset) {
            return;
        }

        const cellData = data.rows[0][columnName];

        const yqlTypes = selectYqlTypes(state);
        const rows = [...selectRows(state)];

        const rowData = {...rows[rowIndex]};
        Object.assign(rowData, {[columnName]: cellData});
        rows[rowIndex] = rowData;

        dispatch({type: GET_TABLE_DATA.SUCCESS, data: {rows, yqlTypes}});
    };
}
