import type {QueryResult as ApiResult} from '../../types/query-tracker/api';
import type {QueryResultReadyState, SourceRow} from '../../types/query-tracker/queryResult';
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

export function prepareLegacyRows(rows: SourceRow[]): QueryResultReadyState['results'] {
    return rows.map(({cells}) =>
        Object.fromEntries(
            Object.entries(cells).map(([name, cell]) => [
                name,
                cell.previewLoaded
                    ? prepareFormattedValue(cell.value, cell.type, {
                          maxListSize: undefined,
                          maxStringSize: undefined,
                          treatValAsData: true,
                      })
                    : prepareFormattedValue(cell.value, cell.type),
            ]),
        ),
    );
}
