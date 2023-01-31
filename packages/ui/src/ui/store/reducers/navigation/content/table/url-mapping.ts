import produce from 'immer';
import {RootState} from '../../../../../store/reducers';
import {initialState} from '../../../../../store/reducers/navigation/content/table/table';
import {updateIfChanged} from '../../../../../utils/utils';

export const tableParams = {
    offsetValue: {
        stateKey: 'navigation.content.table.offsetValue',
        initialState: initialState.offsetValue,
    },
    offsetMode: {
        stateKey: 'navigation.content.table.offsetMode',
        initialState: initialState.offsetMode,
    },
    pageSize: {
        stateKey: 'navigation.content.table.pageSize',
        initialState: initialState.pageSize,
        type: 'number',
    },
    stringLimit: {
        stateKey: 'navigation.content.table.cellSize',
        initialState: initialState.cellSize,
        type: 'number',
    },
    columns: {
        stateKey: 'navigation.content.table.columnsPresetHash',
        initialState: initialState.columnsPresetHash,
    },
};

export function getNavigationTablePreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        const draftTable = draft.navigation.content.table;
        const queryTable = query.navigation.content.table;

        updateIfChanged(draftTable, 'offsetValue', queryTable.offsetValue);
        updateIfChanged(draftTable, 'offsetMode', queryTable.offsetMode);
        updateIfChanged(draftTable, 'pageSize', queryTable.pageSize);
        updateIfChanged(draftTable, 'cellSize', queryTable.cellSize);
        updateIfChanged(draftTable, 'columnsPresetHash', queryTable.columnsPresetHash);
    });
}
