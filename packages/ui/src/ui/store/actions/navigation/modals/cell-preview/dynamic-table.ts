import type {CellPreviewActionType} from '../../../modals/cell-preview';
import {
    getCurrentRowKey,
    getKeyColumns,
    getYqlTypes,
} from '../../../../selectors/navigation/content/table-ts';
import Query from '../../../../../utils/navigation/content/table/query';
import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import type {CancelTokenSource} from 'axios';
import {getCliCommandResultFormat} from './format';

export const getDynamicTableCellPath = ({
    index,
    path,
    columnName,
}: {
    path: string;
    columnName: string;
    index: number;
}): CellPreviewActionType => {
    return (_, getState) => {
        const yqlTypes = getYqlTypes(getState());
        const key = getCurrentRowKey(getState(), index);
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

export const loadDynamicTableCellPreview = ({
    cellPath,
    output_format,
    cancellation,
}: {
    cellPath: string;
    output_format: any;
    cancellation: (token: CancelTokenSource) => void;
}) => {
    return async () => {
        const setup = {};

        return await ytApiV3Id.selectRows(YTApiId.dynTableSelectRowsPreload, {
            setup,
            parameters: {
                output_format,
                query: cellPath,
            },
            cancellation,
        });
    };
};
