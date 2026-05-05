import type {QueryResultReadyState} from '../../../../../types/query-tracker/queryResult';
import {useEffect, useMemo, useState} from 'react';

export const useQueryResultTableData = (
    result: QueryResultReadyState,
): {
    results: QueryResultReadyState['results'];
    columns: QueryResultReadyState['columns'];
    visibleColumns: string[];
    transposed: boolean;
    startIndex: number;
} => {
    const [realResult, setResult] = useState<QueryResultReadyState | undefined>(undefined);
    useEffect(() => {
        const timer = setTimeout(() => {
            setResult(result);
        }, 0);
        return () => {
            clearTimeout(timer);
        };
    }, [result]);

    const visibleColumns = useMemo(() => {
        if (result.settings?.visibleColumns) {
            return result.settings?.visibleColumns;
        }
        return result.columns.map(({name}) => name);
    }, [result.settings?.visibleColumns, realResult]);

    const startIndex = useMemo(() => {
        return (result.page ? result.page * result.settings.pageSize : 0) + 1;
    }, [result.page, result.settings.pageSize]);

    return {
        results: result.results,
        columns: result.columns,
        visibleColumns,
        transposed: Boolean(result.settings?.transposed),
        startIndex,
    };
};
