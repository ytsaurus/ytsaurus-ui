import {type CellPreviewActionType} from '../../../modals/cell-preview';
import {getOffsetValue} from '../../../../selectors/navigation/content/table';
import type {CancelTokenSource} from 'axios';
import {ytApiV4} from '../../../../../rum/rum-wrap-api';
import {YSON_AS_TEXT, prettyPrint} from '../../../../../utils/unipika';
import {getCliCommandResultFormat} from './format';

export const getStaticTableCellPath = ({
    path,
    columnName,
    rowIndex: index,
}: {
    path: string;
    columnName: string;
    rowIndex: number;
}): CellPreviewActionType => {
    return (_, getState) => {
        const offset = getOffsetValue(getState());

        const rowIndex = typeof offset === 'number' ? index + offset : index;

        return `${path}{${prettyPrint(columnName, YSON_AS_TEXT())}}[#${rowIndex}:#${rowIndex + 1}]`;
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
}): Promise<unknown> => {
    return ytApiV4.readTable({
        parameters: {
            path: cellPath,
            output_format,
        },
        cancellation,
    });
};
