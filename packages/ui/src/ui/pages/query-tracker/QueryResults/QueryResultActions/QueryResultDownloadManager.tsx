import {type QueryResultColumn} from '../../../../types/query-tracker/queryResult';
import qs from 'qs';
import React, {useMemo, useState} from 'react';
import {selectCluster} from '../../../../store/selectors/global';
import {DownloadManager} from '../../../../components/DownloadManager';
import {getDownloadQueryResultURL} from '../../../../store/actions/query-tracker/api';
import {selectQueryResult} from '../../../../store/selectors/query-tracker/queryResult';
import {type RootState} from '../../../../store/reducers';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {getExportTableBaseUrl} from '../../../../config';
import {downloadFile} from '../../../../store/actions/navigation/content/table/download-manager';

type QueryResultExtraProps = {
    getDownloadBaseUrl: (cursor: {start: number; end: number} | undefined) => string;
    queryId: string;
    resultIndex: number;
};

class QueryResultTableDownloadManager extends DownloadManager<QueryResultExtraProps> {
    getDefaultFilename(): string {
        const {queryId, resultIndex} = this.props;

        return `query_result_${queryId}_${resultIndex + 1}`;
    }

    getDownloadParams() {
        const {value: output_format, error} = this.getOutputFormat();
        const {format} = this.state;
        const params: Record<string, unknown> = {
            output_format,
            dump_error_into_response: true,
        };
        if (format !== 'schemaful_dsv') {
            params['columns'] = this.prepareColumnsForColumnMode(false);
        }

        const query = qs.stringify(params);
        return {query, error};
    }

    getDownloadLink() {
        const {getDownloadBaseUrl, cluster, queryId, resultIndex} = this.props;
        const {rowsMode, startRow, numRows, format, number_precision_mode} = this.state;

        const {query, error} = this.getDownloadParams();

        if (format === 'excel') {
            const base = `${getExportTableBaseUrl({cluster})}/${cluster}/api/export-query-result`;
            const params = new URLSearchParams({
                number_precision_mode,
                result_index: String(resultIndex),
                query_id: queryId,
            });

            if (rowsMode === 'range') {
                params.append('lower_row_index', startRow.toString());
                params.append(
                    'upper_row_index',
                    ((startRow as number) + (numRows as number)).toString(),
                );
            }

            const columns = this.prepareColumnsForColumnMode(false);
            const columnsString = columns ? '&' + columns.map((i) => `columns=${i}`).join('&') : '';

            return {url: `${base}?${params}${columnsString}`, error};
        }

        const cursor =
            rowsMode === 'range'
                ? {start: startRow as number, end: (startRow as number) + (numRows as number)}
                : undefined;
        const base = getDownloadBaseUrl(cursor);

        return {
            url: `${base}&${query}`,
            error,
        };
    }
}

type Props = {
    queryId: string;
    resultIndex: number;
    allColumns: QueryResultColumn[];
    visibleColumns?: string[];
    className?: string;
};

export const QueryResultDownloadManager = React.memo(function QueryResultDownloadManager({
    queryId,
    resultIndex,
    allColumns,
    visibleColumns,
    className,
}: Props) {
    const cluster = useSelector(selectCluster);
    const result = useSelector((state: RootState) =>
        selectQueryResult(state, queryId, resultIndex),
    );
    const dispatch = useDispatch();
    const startRow = result?.resultReady ? result?.page * result?.settings?.pageSize || 0 : 0;
    const allItems = useMemo(() => {
        return allColumns.map((item) => ({
            name: item.displayName,
            checked: visibleColumns ? visibleColumns?.includes(item.name) : true,
        }));
    }, [allColumns, visibleColumns]);
    const [opened, setOpened] = useState(false);

    const handleDownload = async (url: string, filename: string) => {
        await dispatch(downloadFile(url, filename));
    };

    const handleCopy = async (url: string, filename: string) => {
        await dispatch(downloadFile(url, filename, true));
    };

    const getDownloadBaseUrl = (cursor: {start: number; end: number} | undefined) =>
        dispatch(getDownloadQueryResultURL(cluster, queryId, resultIndex, cursor));

    return (
        <QueryResultTableDownloadManager
            getDownloadBaseUrl={getDownloadBaseUrl}
            toggleVisible={() => {}}
            queryId={queryId}
            resultIndex={resultIndex}
            className={className}
            cluster={cluster}
            rowCount={result?.resultReady ? result?.meta.data_statistics.row_count : 0}
            allColumns={allItems}
            srcColumns={allItems}
            columns={allItems}
            pageSize={result?.resultReady ? result?.settings?.pageSize || 50 : 50}
            showDecoded={false}
            loading={false}
            visible={opened}
            handleShow={() => setOpened(true)}
            handleClose={() => setOpened(false)}
            offsetValue={startRow}
            isSchematicTable={true}
            downloadFile={handleDownload}
            downloadToClipboard={handleCopy}
        />
    );
});
