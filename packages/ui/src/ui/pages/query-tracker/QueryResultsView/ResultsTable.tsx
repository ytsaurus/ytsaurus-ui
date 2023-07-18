import React, {useEffect, useMemo, useState} from 'react';
import {YCLOUD_THEME} from '@gravity-ui/react-data-table/build/esm/lib/constants';
import YQLTable from './YQLTable/YQLTable';
import {formatResults} from '../module/query_result/utils/format';
import {QueryResultReadyState} from '../module/query_result/types';
import isEqual from 'lodash/isEqual';

const settings = {
    escapeWhitespace: false,
    decodeUTF8: true,
    showDecoded: false,
    binaryAsHex: true,
    escapeYQLStrings: true,
    stringAsJSON: false,
    omitStructNull: true,
    maxStringSize: undefined,
    customNumberFormatter: {
        numberFormatDigitSpaces: true,
        numberFormatDisableExponential: true,
        numberFormatPrecision: undefined,
    },
};

const useYqlTable = (
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

export const ResultsTable = React.memo(
    function ResultsTable({result}: {result: QueryResultReadyState}) {
        const [results, columns, visibleColumns, transposed, startIndex] = useYqlTable(result);
        return (
            <YQLTable
                format={formatResults}
                formatterSettings={settings}
                header={columns}
                rows={results}
                transpose={transposed}
                resultType="table"
                showColumns={visibleColumns}
                defaultNumberAlign={'right'}
                startIndex={startIndex}
                theme={YCLOUD_THEME}
            />
        );
    },
    (prev, next) => {
        return (
            prev.result.columns === next.result.columns &&
            prev.result.results === next.result.results &&
            isEqual(prev.result.settings?.visibleColumns, next.result.settings?.visibleColumns) &&
            prev.result.settings?.transposed === next.result.settings?.transposed
        );
    },
);
