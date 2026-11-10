import type {QueryResult as ApiResult} from '../../types/query-tracker/api';
import type {
    FormattedQueryResultReadyState,
    SourceCell,
    SourceRow,
} from '../../types/query-tracker/queryResult';
import {prepareFormattedValue} from '../queries/format';

export function prepareSourceRows(data: ApiResult, offset = 0, previewLoaded = false): SourceRow[] {
    return data.rows.map((row, index) => ({
        sourceIndex: offset + index,
        cells: Object.fromEntries(
            Object.entries(row).map(([name, [value, typeIndex]]) => [
                name,
                {value, type: data.yql_type_registry[Number(typeIndex)], previewLoaded},
            ]),
        ),
    }));
}

// Source cells are replaced immutably; weak keys let discarded results be collected.
const formattedCells = new WeakMap<SourceCell, ReturnType<typeof prepareFormattedValue>>();

function prepareFormattedCell(cell: SourceCell) {
    const cached = formattedCells.get(cell);
    if (cached) return cached;

    const formatted = cell.previewLoaded
        ? prepareFormattedValue(cell.value, cell.type, {
              maxListSize: undefined,
              maxStringSize: undefined,
              treatValAsData: true,
          })
        : prepareFormattedValue(cell.value, cell.type);
    formattedCells.set(cell, formatted);
    return formatted;
}

export function prepareFormattedRows(rows: SourceRow[]): FormattedQueryResultReadyState['results'] {
    return rows.map(({cells}) =>
        Object.fromEntries(
            Object.entries(cells).map(([name, cell]) => [name, prepareFormattedCell(cell)]),
        ),
    );
}
