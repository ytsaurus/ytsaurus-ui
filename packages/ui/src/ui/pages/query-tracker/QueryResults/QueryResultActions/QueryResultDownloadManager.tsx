import {QueryResultColumn} from '../../module/query_result/types';
import qs from 'qs';
import PropTypes from 'prop-types';
import React, {useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {getCluster} from '../../../../store/selectors/global';
import {DownloadManager} from '../../../navigation/content/Table/DownloadManager/DownloadManager';
import {getDownloadQueryResultURL} from '../../module/api';
import {getQueryResult} from '../../module/query_result/selectors';
import {RootState} from '../../../../store/reducers';

export class QueryResultTableDownloadManager extends DownloadManager {
    static propTypes = {
        ...super.propTypes,
        queryId: PropTypes.string.isRequired,
        resultIndex: PropTypes.number.isRequired,
    };

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
        const {cluster, queryId, resultIndex} = this.props;
        const {rowsMode, startRow, numRows} = this.state;
        const cursor =
            rowsMode === 'range' ? {start: startRow, end: startRow + numRows} : undefined;
        const base = getDownloadQueryResultURL(cluster, queryId, resultIndex, cursor);

        const {query, error} = this.getDownloadParams();
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
    const cluster = useSelector(getCluster);
    const result = useSelector((state: RootState) => getQueryResult(state, queryId, resultIndex));
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
            path={''}
            visible={opened}
            handleShow={() => setOpened(true)}
            handleClose={() => setOpened(false)}
            offsetValue={startRow}
            isSchematicTable={false}
        />
    );
});
