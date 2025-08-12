import {type CellPreviewActionType} from '../../../modals/cell-preview';
import {getOffsetValue} from '../../../../selectors/navigation/content/table';
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
