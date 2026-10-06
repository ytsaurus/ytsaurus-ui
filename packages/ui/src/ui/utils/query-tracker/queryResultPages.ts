import type {QueryResult} from '../../types/query-tracker/api';

// Each response owns its type registry. Rebase type references when appending rows.
export function appendQueryResultPage(previous: QueryResult, next: QueryResult): QueryResult {
    const offset = previous.yql_type_registry.length;
    const rows = next.rows.map((row) =>
        Object.fromEntries(
            Object.entries(row).map(([name, [value, type]]) => [
                name,
                [value, String(Number(type) + offset)] as [unknown, string],
            ]),
        ),
    );
    return {
        ...previous,
        rows: [...previous.rows, ...rows],
        yql_type_registry: [...previous.yql_type_registry, ...next.yql_type_registry],
    };
}
