import type {QueryResultReadyState} from '../../../../../types/query-tracker/queryResult';
import {useEffect, useMemo, useState} from 'react';

export const useYqlTable = (
    result: QueryResultReadyState,
): [
    QueryResultReadyState['results'],
    QueryResultReadyState['columns'],
    string[],
    boolean,
    number,
] => {
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

    return [
        result.results,
        result.columns,
        visibleColumns,
        Boolean(result.settings?.transposed),
        startIndex,
    ];
};
