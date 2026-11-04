import unipika from '../../common/thor/unipika';
import type {QueryResultCellSettings} from '@gravity-ui/querieskit';
import type {SourceRow} from '../../types/query-tracker/queryResult';

export const sourceResultCellSettings: QueryResultCellSettings<SourceRow> = {
    getCellValue: ({row, column}) => row.cells[column.name]?.value,
    getCellType: ({row, column}) => row.cells[column.name]?.type,
    getCellOptions: ({row, column}) => {
        const cell = row.cells[column.name];
        const options = cell?.previewLoaded
            ? {formatterSettings: {maxListSize: undefined, maxStringSize: undefined}}
            : {};
        if (!cell) return options;
        let type = cell.type;
        while (type?.[0] === 'OptionalType') type = type[1] as typeof type;
        if (type?.[0] !== 'TaggedType' || type[1] !== 'url') return options;
        try {
            const converted = unipika.converters.yql([cell.value, cell.type], {
                treatValAsData: true,
            });
            const node = converted.$value;
            const copyText =
                node?.$type === 'tag_value' ? node.$value.text || node.$value.href : node?.$value;
            return typeof copyText === 'string' ? {...options, copyText} : options;
        } catch {
            return options;
        }
    },
    formatterSettings: {maxListSize: 50, treatValAsData: true},
    maxVisibleLines: 5,
    collapseAfterLines: 8,
    maxInlineTextLength: 10000,
};
