import type {CellPreviewActionType} from '../../../modals/cell-preview';
import {
    getCurrentRowKey,
    getKeyColumns,
    getYqlTypes,
} from '../../../../selectors/navigation/content/table-ts';
import Query from '../../../../../utils/navigation/content/table/query';
import {getCliCommandResultFormat} from './format';

export const getDynamicTableCellPath = ({
    rowIndex,
    path,
    columnName,
}: {
    path: string;
    columnName: string;
    rowIndex: number;
}): CellPreviewActionType<string> => {
    return (_, getState) => {
        const yqlTypes = getYqlTypes(getState());
        const key = getCurrentRowKey(getState(), rowIndex);
        const keyColumns = getKeyColumns(getState());

        const offset = Query.prepareKey(key, yqlTypes);

        return Query.prepareQuery({
            path,
            offset,
            offsetColumns: keyColumns,
            columns: [columnName],
            limit: 1,
        });
    };
};

export const getDynamicTableCliCommand = ({
    cellPath,
    tag,
    columnName,
}: {
    cellPath: string;
    columnName: string;
    tag?: string;
}): string => {
    return `yt select-rows 'select ${cellPath}' ${getCliCommandResultFormat({columnName, tag})}`;
};
