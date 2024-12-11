import {type CellPreviewActionType} from '../../../modals/cell-preview';
import {getOffsetValue} from '../../../../selectors/navigation/content/table';
import type {CancelTokenSource} from 'axios';
import {ytApiV4} from '../../../../../rum/rum-wrap-api';
import {getCliCommandResultFormat} from './format';

export const getStaticTableCellPath = ({
    path,
    columnName,
    index,
}: {
    path: string;
    columnName: string;
    index: number;
}): CellPreviewActionType => {
    return (_, getState) => {
        const offset = getOffsetValue(getState());

        const rowIndex = typeof offset === 'number' ? index + offset : index;

        return `${path}{${columnName}}[#${rowIndex}:#${rowIndex + 1}]`;
    };
};

export const getStaticTableCliCommand = ({
    cellPath,
    columnName,
    tag,
}: {
    cellPath: string;
    columnName: string;
    tag?: string;
}): string => {
    return `yt read-table '${cellPath}' ${getCliCommandResultFormat({columnName, tag})}`;
};

export const loadStaticTableCellPreview = ({
    cellPath,
    output_format,
    cancellation,
}: {
    cellPath: string;
    output_format: any;
    cancellation: (token: CancelTokenSource) => void;
}): CellPreviewActionType => {
    return async () => {
        return await ytApiV4.readTable({
            parameters: {
                path: cellPath,
                output_format,
            },
            cancellation,
        });
    };
};
