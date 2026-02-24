import {useCallback, useEffect, useState} from 'react';
import type {NavigationTableData, NavigationTableDataAdapter} from '../types';

const filterValueInText = (value: string, filter: string) =>
    value.toLowerCase().includes(filter.toLowerCase());

const applyFilter = (table: NavigationTableData, filter: string): NavigationTableData => {
    if (!filter) return table;
    return {
        ...table,
        schema: table.schema.filter(
            ({name, type}) => filterValueInText(name, filter) || filterValueInText(type, filter),
        ),
    };
};

export type UseNavigationTableDataOptions = {
    path: string;
    adapter: NavigationTableDataAdapter;
};

export type UseNavigationTableDataResult = {
    table: NavigationTableData | null;
    tableWithFilter: NavigationTableData | null;
    loading: boolean;
    error: Error | null;
    filter: string;
    setFilter: (value: string) => void;
    load: (path: string) => Promise<void>;
};

/**
 * Hook that takes path and adapter, returns table data and filter state for NavigationTable.
 * Host app provides the adapter (e.g. using Redux/YT API).
 */
export const useNavigationTableData = (
    options: UseNavigationTableDataOptions,
): UseNavigationTableDataResult => {
    const {path, adapter} = options;
    const [table, setTable] = useState<NavigationTableData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [filter, setFilter] = useState('');

    const load = useCallback(
        async (loadPath: string) => {
            setLoading(true);
            setError(null);
            try {
                const data = await adapter.loadTable(loadPath);
                setTable(data);
            } catch (e) {
                setError(e instanceof Error ? e : new Error(String(e)));
                setTable(null);
            } finally {
                setLoading(false);
            }
        },
        [adapter],
    );

    useEffect(() => {
        if (path) {
            load(path);
        } else {
            setTable(null);
            setError(null);
        }
    }, [path, load]);

    const tableWithFilter = table ? applyFilter(table, filter) : null;

    return {
        table,
        tableWithFilter,
        loading,
        error,
        filter,
        setFilter,
        load,
    };
};
