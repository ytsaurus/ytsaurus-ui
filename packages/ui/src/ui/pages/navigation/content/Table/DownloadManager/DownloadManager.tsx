import React from 'react';
import {ConnectedProps, connect} from 'react-redux';
import unipika from '../../../../../common/thor/unipika';
import {compose} from 'redux';
import cn from 'bem-cn-lite';

import filter_ from 'lodash/filter';
import find_ from 'lodash/find';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';
import values_ from 'lodash/values';

import qs from 'qs';
import axios from 'axios';

import {Checkbox, SegmentedRadioGroup, TextInput} from '@gravity-ui/uikit';

import ColumnSelector from '../../../../../components/ColumnSelector/ColumnSelector';
import Pagination from '../../../../../components/Pagination/Pagination';
import HelpLink from '../../../../../components/HelpLink/HelpLink';
import Filter from '../../../../../components/Filter/Filter';
import Button from '../../../../../components/Button/Button';
import Modal from '../../../../../components/Modal/Modal';
import Icon from '../../../../../components/Icon/Icon';
import Link from '../../../../../components/Link/Link';
import Tabs from '../../../../../components/Tabs/Tabs';

import {getRowsPerTablePage, getShowDecoded} from '../../../../../store/selectors/settings';
import {getSchema} from '../../../../../store/selectors/navigation/tabs/schema';
import {getPath, getTransaction} from '../../../../../store/selectors/navigation';
import {getCluster, getCurrentClusterConfig} from '../../../../../store/selectors/global';
import withVisible, {WithVisibleProps} from '../../../../../hocs/withVisible';
import {
    getAllColumns,
    getOffsetValue,
    getRowCount,
    getSrcColumns,
} from '../../../../../store/selectors/navigation/content/table';
import {getColumns} from '../../../../../store/selectors/navigation/content/table-ts';
import {downloadFile} from '../../../../../store/actions/navigation/content/table/download-manager';

import './DownloadManager.scss';
import {docsUrl, getExportTableBaseUrl} from '../../../../../config';
import SeparatorInput, {prepareSeparatorValue} from './SeparatorInput';
import UIFactory from '../../../../../UIFactory';
import {makeDirectDownloadPath} from '../../../../../utils/navigation';
import {RootState} from '../../../../../store/reducers';
import {FIX_MY_TYPE} from '../../../../../types';
import {ConfirmButton} from './ConfirmButton';
import {ThunkDispatch} from 'redux-thunk';

const block = cn('table-download-manager');
const messageBlock = cn('elements-message');

function checkExcelExporter(cluster: string) {
    const EXCEL_BASE_URL = getExportTableBaseUrl({cluster});

    if (!EXCEL_BASE_URL) {
        return Promise.resolve(false);
    }

    return axios
        .get(`${EXCEL_BASE_URL}/${cluster}/api/ready`)
        .then(() => true)
        .catch(() => false);
}

type ReduxProps = Omit<ConnectedProps<typeof connector>, 'downloadFile'>;
type Props = ReduxProps &
    WithVisibleProps & {
        className?: string;
        downloadFile: (url: string, filename: string) => Promise<void>;
        downloadToClipboard?: (url: string, filename: string) => Promise<void>;
    };

type State = {
    format: 'dsv' | 'schemaful_dsv' | 'yson' | 'json' | 'excel';
    visible?: boolean;
    excelExporter: boolean;
    rowsMode: 'range' | 'all';
    startRow: string | number;
    numRows: string | number;
    valueSentinel: string;
    ysonFormat: 'text' | 'pretty' | 'binary';
    columnsMode: 'all' | 'custom';
    filename: string;

    schemafulDsvMissingMode: 'fail' | 'skip_row' | 'print_sentinel';
    separators: {keyValue?: string; record?: string; field?: string};

    encodeUtf: boolean;
    withHeaders: boolean;

    withSubkey: boolean;
    keyColumn?: string;
    valueColumn?: string;
    subkeyColumn?: string;

    selectedColumns?: Props['columns'];

    number_precision_mode: 'string' | 'error' | 'lose';
};

export class DownloadManager extends React.Component<Props, State> {
    static prepareValue(value: string): number | string {
        const parsedValue = Number(value || undefined); // we need `|| undefined` cause Number('') === 0
        return isNaN(parsedValue) ? value : parsedValue;
    }

    static prepareColumns(columns: Array<{checked?: boolean}>) {
        return filter_(columns, ({checked}) => checked);
    }

    static hasColumn(columns: Array<{name?: string}>, name: string) {
        return Boolean(find_(columns, (column) => column.name === name));
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        if (nextProps.visible !== prevState.visible) {
            const {columns} = nextProps;
            return {
                visible: nextProps.visible,
                numRows: nextProps.pageSize,
                startRow: nextProps.offsetValue,
                selectedColumns: nextProps.allColumns,

                withSubkey: nextProps.columns.length >= 3,
                keyColumn: DownloadManager.hasColumn(columns, 'key') ? 'key' : undefined,
                valueColumn: DownloadManager.hasColumn(columns, 'value') ? 'value' : undefined,
                subkeyColumn: DownloadManager.hasColumn(columns, 'subkey') ? 'subkey' : undefined,
            };
        }

        return null;
    }

    constructor(props: Props) {
        super(props);

        const {columns, visible, pageSize, offsetValue, allColumns} = props;

        this.state = {
            format: 'dsv',
            visible,
            rowsMode: 'all',
            valueSentinel: '',
            ysonFormat: 'text',
            columnsMode: 'all',
            schemafulDsvMissingMode: 'fail', //print_sentinel
            filename: this.filename,

            separators: {
                keyValue: '=',
                field: '\\t',
                record: '\\n',
            },

            encodeUtf: false,
            withHeaders: true,

            withSubkey: columns.length >= 3,
            keyColumn: DownloadManager.hasColumn(columns, 'key') ? 'key' : undefined,
            valueColumn: DownloadManager.hasColumn(columns, 'value') ? 'value' : undefined,
            subkeyColumn: DownloadManager.hasColumn(columns, 'subkey') ? 'subkey' : undefined,

            numRows: pageSize,
            startRow: offsetValue,
            selectedColumns: allColumns,

            excelExporter: false,
            number_precision_mode: 'string',
        };
    }

    getOutputFormat() {
        const {
            format,
            encodeUtf,
            ysonFormat,
            schemafulDsvMissingMode,
            valueSentinel,
            withHeaders,
            separators,
        } = this.state;

        const currentAttributes: Record<string, any> = {};
        const outputFormat = {
            $value: format,
            $attributes: currentAttributes,
        };

        if (format === 'json') {
            currentAttributes['encode_utf8'] = encodeUtf;
        }

        if (format === 'yson') {
            currentAttributes['format'] = ysonFormat;
        }

        if (format === 'schemaful_dsv') {
            currentAttributes['missing_value_mode'] = schemafulDsvMissingMode;

            if (schemafulDsvMissingMode === 'print_sentinel') {
                currentAttributes['missing_value_sentinel'] = valueSentinel;
            }

            currentAttributes['enable_column_names_header'] = withHeaders;

            currentAttributes['columns'] = this.prepareColumnsForColumnMode(false);
        }

        const errors: Array<string> = [];

        function collectErrors<T>({value, error}: {value: T; error?: string}) {
            if (error) {
                errors.push(error);
            }
            return value;
        }

        if (format === 'schemaful_dsv' || format === 'dsv') {
            currentAttributes['field_separator'] = collectErrors(
                prepareSeparatorValue(separators.field),
            );
            currentAttributes['record_separator'] = collectErrors(
                prepareSeparatorValue(separators.record),
            );
        }

        if (format === 'dsv') {
            currentAttributes['key_value_separator'] = collectErrors(
                prepareSeparatorValue(separators.keyValue),
            );
        }

        return {
            value: outputFormat,
            error:
                errors.length === 0
                    ? undefined
                    : {inner_errors: errors, message: 'There are some values with errors'},
        };
    }

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

    get filename() {
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
        const {cluster, proxy, externalProxy} = this.props;
        const {format, number_precision_mode} = this.state;
        const {query, error} = this.getDownloadParams();

        if (format === 'excel') {
            const base = `${getExportTableBaseUrl({cluster})}/${cluster}/api/export`;
            const params = new URLSearchParams({number_precision_mode});
            return {url: `${base}?${params}&${query}`, error};
        }

        const base = makeDirectDownloadPath('read_table', {cluster, proxy, externalProxy});

        return {url: `${base}?${query}`, error};
    }

    makeDocsUrl(path = '') {
        return docsUrl(UIFactory.docsUrls['storage:formats'] + path);
    }

    get formats() {
        const {isSchematicTable} = this.props;
        const {excelExporter} = this.state;

        return {
            dsv: {
                name: 'dsv' as const,
                caption: 'TSKV',
                description:
                    'Tab-separated key-value format. ' +
                    'Please note that this format erases type information due to string conversion.',
                doc: this.makeDocsUrl('#dsv'),
                show: true,
            },
            schemaful_dsv: {
                name: 'schemaful_dsv' as const,
                caption: 'Schemaful DSV',
                description: [
                    'Tab-separated format with fixed, ordered set of columns.',
                    'Please note that this format erases type information due to string conversion.',
                ].join(' '),
                doc: this.makeDocsUrl('#schemaful_dsv'),
                show: true,
            },
            yson: {
                name: 'yson' as const,
                caption: 'YSON',
                description: 'Yet-another Serialized Object Notation.',
                doc: this.makeDocsUrl('#yson'),
                show: true,
            },
            json: {
                name: 'json' as const,
                caption: 'JSON Lines',
                description:
                    'JSON Lines text format, also called newline-delimited JSON (JavaScript Serialized Object Notation).',
                doc: this.makeDocsUrl('#json'),
                show: true,
            },
            excel: {
                name: 'excel' as const,
                caption: 'Excel',
                description: '',
                doc: docsUrl(UIFactory.docsUrls['storage:excel#skachivanie']),
                show: excelExporter && isSchematicTable,
            },
        };
    }

    get tabItems() {
        return map_(values_(this.formats), ({name, caption, show}) => ({
            value: name,
            text: caption,
            show,
        }));
    }

    changeFormat = (format: State['format']) => this.setState({format});
    changeFilename = (filename: State['filename']) => this.setState({filename});
    changeNumRows = (numRows: State['numRows']) => this.setState({numRows});
    changeStartRow = (startRow: State['startRow']) => this.setState({startRow});
    changeRowsMode = (rowsMode: State['rowsMode']) => this.setState({rowsMode});
    changeKeyColumn = (keyColumn: State['keyColumn']) => this.setState({keyColumn});
    changeYsonFormat = (ysonFormat: State['ysonFormat']) => this.setState({ysonFormat});
    changeValueColumn = (valueColumn: State['valueColumn']) => this.setState({valueColumn});
    changeColumnsMode = (columnsMode: State['columnsMode']) => this.setState({columnsMode});
    changeSubkeyColumn = (subkeyColumn: State['subkeyColumn']) => this.setState({subkeyColumn});
    changeValueSentinel = (valueSentinel: State['valueSentinel']) => this.setState({valueSentinel});
    changeSelectedColumns = (selectedColumns: State['selectedColumns']) =>
        this.setState({selectedColumns});
    changeSchemafulDsvMissingMode = (schemafulDsvMissingMode: State['schemafulDsvMissingMode']) =>
        this.setState({schemafulDsvMissingMode});

    toggleEncodeUtf = () => this.setState((prevState) => ({encodeUtf: !prevState.encodeUtf}));
    toggleWithSubkey = () => this.setState((prevState) => ({withSubkey: !prevState.withSubkey}));
    toggleWithHeaders = () => this.setState((prevState) => ({withHeaders: !prevState.withHeaders}));

    parseColumn(column: string, useQuotes: boolean) {
        const {showDecoded} = this.props;
        const parsedColumn = showDecoded ? unipika.decode(column) : column;

        // When forming the url address for reading a table we pass column names as
        // `read_table?path/to/file{"column1","column2"}` where they should be wrapped in quotes

        // In case of schemaful_dsv format column names are passed as part of request params as well. It looks like:
        // read_table?path/to/file{"Clients+group","Offer+rank"}&output_format[$attributes][columns][]=Clients+group&output_format[$attributes][columns][]=Offer+rank

        // [columns][]=Clients+group -- valid,
        // [columns][]="Clients+group" -- invalid

        if (useQuotes) {
            return `"${parsedColumn}"`;
        }

        return parsedColumn;
    }

    prepareColumnsForColumnMode(useQuotes = true) {
        const {columnsMode, selectedColumns} = this.state;

        if (columnsMode === 'all') {
            const preparedColumns = map_(selectedColumns, 'name');

            return map_(preparedColumns, (column) => this.parseColumn(column, useQuotes));
        } else if (columnsMode === 'custom') {
            const preparedColumns = reduce_(
                selectedColumns,
                (columns, item) => {
                    if (item.checked) {
                        columns.push(item.name);
                    }

                    return columns;
                },
                [] as Array<string>,
            );

            return map_(preparedColumns, (column) => this.parseColumn(column, useQuotes));
        }
        return undefined;
    }

    renderPaginator() {
        const {rowCount} = this.props;

        const isStartRowEmpty = this.state.startRow === 0;
        const isNumRowsInvalid = typeof this.state.numRows !== 'number';
        const isStartRowInvalid = typeof this.state.startRow !== 'number';

        const startRow = Number(this.state.startRow);
        const numRows = Number(this.state.numRows);

        return (
            <Pagination
                showInput
                inputValue={String(startRow)}
                onChange={(value: string) => {
                    const row = DownloadManager.prepareValue(value);
                    this.changeStartRow(row);
                }}
                first={{
                    handler: () => {
                        this.changeStartRow(0);
                    },
                    disabled: isStartRowEmpty || isStartRowInvalid || isNumRowsInvalid,
                }}
                previous={{
                    handler: () => {
                        const row = Math.max((startRow as number) - (numRows as number), 0);
                        this.changeStartRow(row);
                    },
                    disabled: isStartRowEmpty || isStartRowInvalid || isNumRowsInvalid,
                }}
                next={{
                    handler: () => {
                        const row =
                            startRow + numRows < rowCount - numRows
                                ? startRow + numRows
                                : Math.max(rowCount - numRows, 0);
                        this.changeStartRow(row);
                    },
                    disabled:
                        startRow + numRows >= rowCount || isStartRowInvalid || isNumRowsInvalid,
                }}
                last={{
                    handler: () => {
                        const row = Math.max(rowCount - numRows, 0);
                        this.changeStartRow(row);
                    },
                    disabled:
                        startRow + numRows >= rowCount || isStartRowInvalid || isNumRowsInvalid,
                }}
            />
        );
    }

    renderFilenameForm() {
        const {filename} = this.state;

        return (
            <div className={block('filename-form')}>
                <div className={block('filename-form__label')}>Filename</div>
                <TextInput size="m" value={filename} onUpdate={this.changeFilename} />
            </div>
        );
    }

    renderRows() {
        const {rowsMode, numRows} = this.state;

        return (
            <React.Fragment>
                <div className="elements-form__label">Rows</div>
                <SegmentedRadioGroup
                    size="m"
                    className="elements-form__field"
                    value={rowsMode}
                    name="download-manager-row-mode"
                    onUpdate={(value) => this.changeRowsMode(value)}
                    options={[
                        {value: 'all', content: 'All'},
                        {value: 'range', content: 'Range'},
                    ]}
                />

                {rowsMode === 'range' && (
                    <div className={block('rows')}>
                        <div className="elements-form__field">
                            <div className="elements-form__label">Start row</div>
                            {this.renderPaginator()}
                        </div>

                        <div className="elements-form__field">
                            <div className="elements-form__label">Number of rows</div>
                            <Filter
                                qa="download-manager_number-of-rows"
                                autofocus={false}
                                value={String(numRows)}
                                invalid={isNaN(numRows as number) || numRows === ''}
                                onChange={(value) => {
                                    const num = DownloadManager.prepareValue(value);
                                    this.changeNumRows(num);
                                }}
                            />
                        </div>
                    </div>
                )}
            </React.Fragment>
        );
    }

    renderColumns() {
        const {columnsMode, format, selectedColumns} = this.state;
        const {srcColumns} = this.props;

        return (
            <React.Fragment>
                <div className="elements-form__label">Columns</div>
                <SegmentedRadioGroup
                    size="m"
                    className="elements-form__field"
                    value={columnsMode}
                    name="download-manager-columns-mode"
                    onUpdate={(value) => this.changeColumnsMode(value)}
                    options={[
                        {value: 'all', content: 'All'},
                        {value: 'custom', content: 'Custom'},
                    ]}
                />

                {columnsMode === 'custom' && (
                    <ColumnSelector
                        isSortable={format === 'schemaful_dsv'}
                        className={block('columns-selector')}
                        onChange={({items}: FIX_MY_TYPE) =>
                            this.changeSelectedColumns(items as FIX_MY_TYPE)
                        }
                        items={selectedColumns}
                        srcItems={srcColumns}
                        isHeadless
                    />
                )}
            </React.Fragment>
        );
    }

    renderSchemafulDsv() {
        const {withHeaders, schemafulDsvMissingMode, valueSentinel} = this.state;

        return (
            <div className={block('schemaful-dsv')}>
                <div className="elements-form__field">
                    <div className="elements-form__label">Missing value mode</div>
                    <SegmentedRadioGroup
                        size="m"
                        value={schemafulDsvMissingMode}
                        name="download-manager-schemaful-dsv-mode"
                        onUpdate={(value) => this.changeSchemafulDsvMissingMode(value)}
                        options={[
                            {value: 'fail', content: 'Fail'},
                            {value: 'skip_row', content: 'Skip row'},
                            {value: 'print_sentinel', content: 'Print sentinel'},
                        ]}
                    />
                </div>

                {schemafulDsvMissingMode === 'print_sentinel' && (
                    <div className="elements-form__field">
                        <div className="elements-form__label">Missing value sentinel</div>
                        <TextInput
                            size="m"
                            value={valueSentinel}
                            onUpdate={this.changeValueSentinel}
                            placeholder="Please note that sentinels that coerce to number or boolean are not supported"
                        />
                    </div>
                )}

                <Checkbox size="l" checked={withHeaders} onChange={this.toggleWithHeaders}>
                    Prepend with column names header
                </Checkbox>
                {this.renderSeparatorEditors()}
            </div>
        );
    }

    renderSeparatorEditors({showKeyValueSeparator = false} = {}) {
        const {keyValue, field, record} = this.state.separators;
        return (
            <div className={block('dsv-separators')}>
                {showKeyValueSeparator && (
                    <div className={block('dsv-separators-item')}>
                        <div className={'elements-form__label'}>Key-value separator</div>
                        <SeparatorInput value={keyValue} onChange={this.setKeyValueSeparator} />
                    </div>
                )}
                <div className={block('dsv-separators-item')}>
                    <div className={'elements-form__label'}>Field separator</div>
                    <SeparatorInput value={field} onChange={this.setFieldSeparator} />
                </div>
                <div className={block('dsv-separators-item')}>
                    <div className={'elements-form__label'}>Record separator</div>
                    <SeparatorInput value={record} onChange={this.setRecordSeparator} />
                </div>
            </div>
        );
    }

    setKeyValueSeparator = (v?: string) => {
        this.onSeparatorChange('keyValue', v);
    };

    setFieldSeparator = (v?: string) => {
        this.onSeparatorChange('field', v);
    };

    setRecordSeparator = (v?: string) => {
        this.onSeparatorChange('record', v);
    };

    onSeparatorChange(separatorType: keyof State['separators'], value?: string) {
        this.setState({
            separators: {
                ...this.state.separators,
                [separatorType]: value,
            },
        });
    }

    renderYson() {
        const {ysonFormat} = this.state;

        return (
            <div className={block('yson')}>
                <div className="elements-form__label">Format</div>
                <SegmentedRadioGroup
                    size="m"
                    value={ysonFormat}
                    name="download-manager-yson-format"
                    onUpdate={(value) => this.changeYsonFormat(value)}
                    options={[
                        {value: 'text', content: 'Text'},
                        {value: 'pretty', content: 'Pretty'},
                        {value: 'binary', content: 'Binary'},
                    ]}
                />
            </div>
        );
    }

    renderJson() {
        const {encodeUtf} = this.state;

        return (
            <div className={block('json')}>
                <Checkbox size="l" checked={encodeUtf} onChange={this.toggleEncodeUtf}>
                    Encode as UTF8
                </Checkbox>
            </div>
        );
    }

    renderExcel() {
        const {number_precision_mode: excelNumberPrecisionMode} = this.state;
        return (
            <React.Fragment>
                <div className="elements-form__label">Number precision mode</div>
                <SegmentedRadioGroup
                    size="m"
                    value={excelNumberPrecisionMode}
                    onUpdate={(v) => this.setState({number_precision_mode: v})}
                    options={[
                        {value: 'string' as const, content: 'String'},
                        {value: 'error' as const, content: 'Error'},
                        {value: 'lose' as const, content: 'Lose'},
                    ]}
                />
            </React.Fragment>
        );
    }

    renderContent() {
        const {format} = this.state;
        const faqLink = (
            <Link url={UIFactory.docsUrls['faq:web_interface_table_download']}>FAQ</Link>
        );
        const cliLink = <Link url={UIFactory.docsUrls['api:cli']}>CLI</Link>;

        const {description, doc} = this.formats[format];

        return (
            <div className={block('content')}>
                <div className={messageBlock({theme: 'warning'})}>
                    Please note that download error if any is appended at the end of the file and is
                    marked with special delimiters.{' '}
                    {docsUrl(<>See our {faqLink} for more details.</>)}
                </div>
                <div className={messageBlock({theme: 'warning'})}>
                    Please note that this is not a production-ready tool. For production usecases we
                    highly recommend using yt read command from our {docsUrl(cliLink, 'CLI')}{' '}
                    instead as it provides advanced features like error detection, download retries,
                    and more.
                </div>

                <div className={block('manager')}>
                    <div className={block('format')}>
                        <Tabs
                            size="l"
                            active={format}
                            layout="vertical"
                            items={this.tabItems}
                            className={block('tabs')}
                            onTabChange={this.changeFormat}
                        />

                        <div className={block('help')}>
                            <p className={block('format-description')}>{description}</p>
                            {doc && <HelpLink url={doc} />}
                        </div>
                    </div>

                    <div className={block('settings', 'pretty-scroll')}>
                        <div className={block('shared-settings', 'elements-form__field')}>
                            {this.renderRows()}
                            {this.renderColumns()}
                        </div>

                        <div className={block('type-settings')}>
                            {format === 'dsv' &&
                                this.renderSeparatorEditors({showKeyValueSeparator: true})}
                            {format === 'schemaful_dsv' && this.renderSchemafulDsv()}
                            {format === 'json' && this.renderJson()}
                            {format === 'yson' && this.renderYson()}
                            {format === 'excel' && this.renderExcel()}
                        </div>
                        {this.renderFilenameForm()}
                    </div>
                </div>
            </div>
        );
    }

    renderModalCopyButton() {
        if (!this.props.downloadToClipboard) return null;

        const {filename} = this.state;
        const {url, error} = this.getDownloadLink();

        return (
            <ConfirmButton
                filename={filename}
                href={url}
                title="Download to clipboard"
                disabled={Boolean(error)}
                qa="download-to-clipboard-static-table"
                onClick={this.props.downloadToClipboard}
            />
        );
    }

    renderModalConfirmButton(classNameConfirm: string) {
        const {filename} = this.state;
        const {url, error} = this.getDownloadLink();

        return (
            <ConfirmButton
                className={classNameConfirm}
                filename={filename}
                href={url}
                title="Download"
                disabled={Boolean(error)}
                view="action"
                qa="download-static-table"
                onClick={this.props.downloadFile}
            />
        );
    }

    showDialog = () => {
        const {handleShow, cluster} = this.props;
        handleShow();
        checkExcelExporter(cluster).then((excelExporter) => {
            this.setState({excelExporter});
        });
    };

    render() {
        const {loading, className, visible, handleClose} = this.props;

        return (
            <div className={block(null, className)}>
                <Button
                    size="m"
                    title="download"
                    disabled={loading}
                    onClick={this.showDialog}
                    qa={'show-download-static-table'}
                >
                    <Icon awesome="download" />
                    &nbsp; Download
                </Button>

                {visible && (
                    <Modal
                        size="l"
                        title="Download"
                        visible={visible}
                        onCancel={handleClose}
                        confirmText="Download"
                        content={this.renderContent()}
                        footerContent={this.renderModalCopyButton.bind(this)()}
                        renderCustomConfirm={this.renderModalConfirmButton.bind(this)}
                    />
                )}
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    const {loading}: {loading: boolean} = state.navigation.content.table;

    const pageSize: number = getRowsPerTablePage(state);
    const showDecoded: boolean = getShowDecoded(state);
    const offsetValue = getOffsetValue(state);
    const allColumns: Array<{name: string; checked: boolean}> = getAllColumns(state);
    const srcColumns = getSrcColumns(state);
    const rowCount = getRowCount(state);
    const cluster = getCluster(state);
    const columns: typeof allColumns = getColumns(state);
    const schema = getSchema(state);
    const path = getPath(state);
    const {proxy, externalProxy} = getCurrentClusterConfig(state);
    const transaction_id = getTransaction(state);

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
        proxy,
        externalProxy,
        transaction_id,
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>) => ({
    downloadFile: (filename: string, url: string) => dispatch(downloadFile(filename, url)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default compose(connector, withVisible)(DownloadManager);
