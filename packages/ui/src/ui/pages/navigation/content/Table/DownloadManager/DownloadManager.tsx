import {connect} from 'react-redux';
import {compose} from 'redux';

import qs from 'qs';

import {DownloadManager} from '../../../../../components/DownloadManager';

import {selectRowsPerTablePage, selectShowDecoded} from '../../../../../store/selectors/settings';
import {selectSchema} from '../../../../../store/selectors/navigation/tabs/schema';
import {selectPath, selectTransaction} from '../../../../../store/selectors/navigation';
import {selectCluster, selectCurrentClusterConfig} from '../../../../../store/selectors/global';
import {selectMergedUiSettings} from '../../../../../store/selectors/global/cluster';
import withVisible from '../../../../../hocs/withVisible';
import {
    selectAllColumns,
    selectOffsetValue,
    selectRowCount,
    selectSrcColumns,
} from '../../../../../store/selectors/navigation/content/table';
import {selectColumns} from '../../../../../store/selectors/navigation/content/table-ts';
import {downloadFile} from '../../../../../store/actions/navigation/content/table/download-manager';

import {getExportTableBaseUrl} from '../../../../../config';
import {makeDirectDownloadPath} from '../../../../../utils/navigation';
import {type RootState} from '../../../../../store/reducers';
import {type ThunkDispatch} from 'redux-thunk';

type NavigationTableExtraProps = {
    path: string;
    transaction_id?: string;
    clusterConfig: ReturnType<typeof selectCurrentClusterConfig>;
    uiSettings: ReturnType<typeof selectMergedUiSettings>;
};

export class NavigationTableDownloadManager extends DownloadManager<NavigationTableExtraProps> {
    get downloadRows() {
        const {rowsMode} = this.state;

        if (rowsMode === 'range') {
            const {startRow, numRows} = this.state;
            return '[#' + startRow + ':#' + (Number(startRow) + Number(numRows)) + ']';
        } else {
            return '';
        }
    }

    get downloadColumns() {
        const {columnsMode} = this.state;

        if (columnsMode !== 'all') {
            const columnNames = this.prepareColumnsForColumnMode();
            return '{' + String(columnNames) + '}';
        } else {
            return '';
        }
    }

    get downloadPath() {
        const {path} = this.props;

        return path + this.downloadColumns + this.downloadRows;
    }

    getDefaultFilename(): string {
        const {path} = this.props;

        return path.split('/')[path.split('/').length - 1];
    }

    getDownloadParams() {
        const {transaction_id} = this.props;
        const {value: output_format, error} = this.getOutputFormat();
        const query = qs.stringify(
            Object.assign(
                {
                    path: this.downloadPath,
                    output_format,
                },
                transaction_id ? {transaction_id} : {},
            ),
        );
        return {query, error};
    }

    getDownloadLink() {
        const {cluster, clusterConfig, uiSettings} = this.props;
        const {format, number_precision_mode} = this.state;
        const {query, error} = this.getDownloadParams();

        if (format === 'excel') {
            const base = `${getExportTableBaseUrl({cluster})}/${cluster}/api/export`;
            const params = new URLSearchParams({number_precision_mode});
            return {url: `${base}?${params}&${query}`, error};
        }

        const base = makeDirectDownloadPath('read_table', {
            clusterConfig,
            uiSettings,
        });

        return {url: `${base}?${query}`, error};
    }
}

const mapStateToProps = (state: RootState) => {
    const {loading}: {loading: boolean} = state.navigation.content.table;

    const pageSize: number = selectRowsPerTablePage(state);
    const showDecoded: boolean = selectShowDecoded(state);
    const offsetValue = selectOffsetValue(state);
    const allColumns: Array<{name: string; checked: boolean}> = selectAllColumns(state);
    const srcColumns = selectSrcColumns(state);
    const rowCount = selectRowCount(state);
    const cluster = selectCluster(state);
    const columns: typeof allColumns = selectColumns(state);
    const schema = selectSchema(state);
    const path = selectPath(state);
    const clusterConfig = selectCurrentClusterConfig(state);
    const transaction_id = selectTransaction(state);
    const uiSettings = selectMergedUiSettings(state);

    const isSchematicTable = schema.length > 0;

    return {
        loading,
        path,
        cluster,
        offsetValue,
        rowCount,
        pageSize,
        allColumns,
        srcColumns,
        columns,
        showDecoded,
        isSchematicTable,
        clusterConfig,
        transaction_id,
        uiSettings,
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>) => ({
    downloadFile: (filename: string, url: string) => dispatch(downloadFile(filename, url)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default compose(connector, withVisible)(NavigationTableDownloadManager);
