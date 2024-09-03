import {QueryResultColumn} from '../../module/query_result/types';
import qs from 'qs';
import React, {useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {getCluster} from '../../../../store/selectors/global';
import {DownloadManager} from '../../../navigation/content/Table/DownloadManager/DownloadManager';
import {getDownloadQueryResultURL} from '../../module/api';
import {getQueryResult} from '../../module/query_result/selectors';
import {RootState} from '../../../../store/reducers';
import {useThunkDispatch} from '../../../../store/thunkDispatch';
import {FIX_MY_TYPE} from '../../../../../@types/types';
import {getExportTableBaseUrl} from '../../../../config';

/**
 * TODO: get rid of inheritance from DownloadManager
 */
export class QueryResultTableDownloadManager extends DownloadManager {
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
        const {getDownloadBaseUrl} = this.props as FIX_MY_TYPE;
        const {rowsMode, startRow, numRows} = this.state;
        const cursor =
            rowsMode === 'range'
                ? {start: startRow as number, end: (startRow as number) + (numRows as number)}
                : undefined;
        const base = getDownloadBaseUrl(cursor);

        const {query, error} = this.getDownloadParams();
        return {
            url: `${base}&${query}`,
            error,
        };
    }

    getExcelDownloadLink() {
        const {cluster, queryId} = this.props as FIX_MY_TYPE;
        const {number_precision_mode, rowsMode, startRow, numRows} = this.state;

        const base = `${getExportTableBaseUrl({cluster})}/${cluster}/api/export-query-result`;
        const params = new URLSearchParams({
            number_precision_mode,
            result_index: '0',
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

        const {error} = this.getDownloadParams();
        return {url: `${base}?${params}${columnsString}`, error};
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
    const cluster = useSelector(getCluster);
    const result = useSelector((state: RootState) => getQueryResult(state, queryId, resultIndex));
    const dispatch = useThunkDispatch();
    const startRow = result?.resultReady ? result?.page * result?.settings?.pageSize || 0 : 0;
    const allItems = useMemo(() => {
        return allColumns.map((item) => ({
            name: item.displayName,
            checked: visibleColumns ? visibleColumns?.includes(item.name) : true,
        }));
    }, [allColumns, visibleColumns]);
    const [opened, setOpened] = useState(false);
    return (
        <QueryResultTableDownloadManager
            {...{
                getDownloadBaseUrl: (cursor: {start: number; end: number} | undefined) =>
                    dispatch(getDownloadQueryResultURL(cluster, queryId, resultIndex, cursor)),
                proxy: '',
                externalProxy: '',
                toggleVisible: () => {},
                transaction_id: undefined,
                queryId,
                resultIndex,
            }}
            className={className}
            cluster={cluster}
            rowCount={result?.resultReady ? result?.meta.data_statistics.row_count : 0}
            allColumns={allItems}
            srcColumns={allItems}
            columns={allItems}
            pageSize={result?.resultReady ? result?.settings?.pageSize || 50 : 50}
            showDecoded={false}
            loading={false}
            path={''}
            visible={opened}
            handleShow={() => setOpened(true)}
            handleClose={() => setOpened(false)}
            offsetValue={startRow}
            isSchematicTable={true}
        />
    );
});
