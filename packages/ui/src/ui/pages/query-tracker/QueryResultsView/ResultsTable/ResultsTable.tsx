import React from 'react';
import {YCLOUD_THEME} from '@gravity-ui/react-data-table/build/esm/lib/constants';
import YQLTable, {type ShowPreviewCallback} from '../YQLTable/YQLTable';
import {formatResults} from '../../../../utils/queries/format';
import {type QueryResultReadyState} from '../../../../types/query-tracker/queryResult';
import isEqual_ from 'lodash/isEqual';
import {useQueryResultTableData} from './hooks/useQueryResultTableData';

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
        result,
        onShowPreview,
    }: {
        result: QueryResultReadyState;
        onShowPreview: ShowPreviewCallback;
    }) {
        const [results, columns, visibleColumns, transposed, startIndex] =
            useQueryResultTableData(result);
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
                onShowPreview={onShowPreview}
            />
        );
    },
    (prev, next) => {
        return (
            prev.result.columns === next.result.columns &&
            prev.result.results === next.result.results &&
            isEqual_(prev.result.settings?.visibleColumns, next.result.settings?.visibleColumns) &&
            prev.result.settings?.transposed === next.result.settings?.transposed
        );
    },
);
