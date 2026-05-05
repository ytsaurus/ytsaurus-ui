import React, {useCallback} from 'react';
import {YCLOUD_THEME} from '@gravity-ui/react-data-table/build/esm/lib/constants';
import {type SortOrder} from '@gravity-ui/react-data-table';
import YQLTable, {type ShowPreviewCallback} from '../YQLTable/YQLTable';
import {formatResults} from '../../../../utils/queries/format';
import {type QueryResultReadyState} from '../../../../types/query-tracker/queryResult';
import isEqual_ from 'lodash/isEqual';
import {useQueryResultTableData} from './hooks/useQueryResultTableData';
import {useDispatch} from '../../../../store/redux-hooks';
import {patchQueryResultSettings} from '../../../../store/actions/query-tracker/queryResult';

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

export const ResultsTable = React.memo(
    function ResultsTable({
        queryId,
        resultIndex,
        result,
        onShowPreview,
    }: {
        queryId: string;
        resultIndex: number;
        result: QueryResultReadyState;
        onShowPreview: ShowPreviewCallback;
    }) {
        const dispatch = useDispatch();
        const {results, columns, visibleColumns, transposed, startIndex} =
            useQueryResultTableData(result);

        const {sortOrder} = result.settings;
        const onSort = useCallback(
            (nextSort?: SortOrder | SortOrder[]) => {
                dispatch(patchQueryResultSettings(queryId, resultIndex, {sortOrder: nextSort}));
            },
            [dispatch, queryId, resultIndex],
        );

        return (
            <YQLTable
                format={formatResults}
                formatterSettings={settings}
                header={columns}
                rows={results}
                transpose={transposed}
                resultType="table"
                showColumns={visibleColumns}
                defaultNumberAlign={'left'}
                startIndex={startIndex}
                theme={YCLOUD_THEME}
                sortOrder={sortOrder}
                onSort={onSort}
                onShowPreview={onShowPreview}
            />
        );
    },
    (prev, next) => {
        return (
            prev.queryId === next.queryId &&
            prev.resultIndex === next.resultIndex &&
            prev.result.columns === next.result.columns &&
            prev.result.results === next.result.results &&
            isEqual_(prev.result.settings?.visibleColumns, next.result.settings?.visibleColumns) &&
            prev.result.settings?.transposed === next.result.settings?.transposed &&
            isEqual_(prev.result.settings?.sortOrder, next.result.settings?.sortOrder)
        );
    },
);
