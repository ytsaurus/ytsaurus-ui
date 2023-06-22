import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import unipika from '../../../../../common/thor/unipika';
import {compose} from 'redux';
import cn from 'bem-cn-lite';
import _ from 'lodash';
import qs from 'qs';
import axios from 'axios';

import {Checkbox, TextInput} from '@gravity-ui/uikit';

import ColumnSelector from '../../../../../components/ColumnSelector/ColumnSelector';
import RadioButton from '../../../../../components/RadioButton/RadioButton';
import Pagination from '../../../../../components/Pagination/Pagination';
import HelpLink from '../../../../../components/HelpLink/HelpLink';
import Filter from '../../../../../components/Filter/Filter';
import Button from '../../../../../components/Button/Button';
import Modal from '../../../../../components/Modal/Modal';
import Icon from '../../../../../components/Icon/Icon';
import Link from '../../../../../components/Link/Link';
import Tabs from '../../../../../components/Tabs/Tabs';
import Select from '../../../../../components/Select/Select';

import {getRowsPerTablePage, getShowDecoded} from '../../../../../store/selectors/settings';
import {getSchema} from '../../../../../store/selectors/navigation/tabs/schema';
import {getPath, getTransaction} from '../../../../../store/selectors/navigation';
import {getCluster, getCurrentClusterConfig} from '../../../../../store/selectors/global';
import withVisible from '../../../../../hocs/withVisible';
import {
    getAllColumns,
    getOffsetValue,
    getRowCount,
    getSrcColumns,
} from '../../../../../store/selectors/navigation/content/table';
import {getColumns} from '../../../../../store/selectors/navigation/content/table-ts';

import './DownloadManager.scss';
import {allowDirectDownload, docsUrl, getConfigData} from '../../../../../config';
import SeparatorInput, {prepareSeparatorValue} from './SeparatorInput';
import UIFactory from '../../../../../UIFactory';

const block = cn('table-download-manager');
const messageBlock = cn('elements-message');

const EXCEL_BASE_URL = getConfigData()?.uiSettings?.exportTableBaseUrl;

function checkExcelExporter(cluster) {
    if (!EXCEL_BASE_URL) {
        return Promise.resolve(false);
    }

    return axios
        .get(`${EXCEL_BASE_URL}/${cluster}/api/ready`)
        .then(() => true)
        .catch(() => false);
}

export class DownloadManager extends Component {
    static propTypes = {
        // from parent
        className: PropTypes.string.isRequired,

        // from connect
        isSchematicTable: PropTypes.bool.isRequired,
        offsetValue: PropTypes.number.isRequired,
        showDecoded: PropTypes.bool.isRequired,
        allColumns: PropTypes.array.isRequired,
        srcColumns: PropTypes.array.isRequired,
        pageSize: PropTypes.number.isRequired,
        rowCount: PropTypes.number.isRequired,
        cluster: PropTypes.string.isRequired,
        columns: PropTypes.array.isRequired,
        loading: PropTypes.bool.isRequired,
        path: PropTypes.string.isRequired,

        // from withVisible
        visible: PropTypes.bool.isRequired,
        handleShow: PropTypes.func.isRequired,
        handleClose: PropTypes.func.isRequired,
    };

    static prepareValue(value) {
        const parsedValue = value === '' ? '' : Number(value);
        return isNaN(parsedValue) ? value : parsedValue;
    }

    static prepareColumns(columns) {
        return _.filter(columns, ({checked}) => checked);
    }

    static hasColumn(columns, name) {
        return _.find(columns, (column) => column.name === name);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.visible !== prevState.visible) {
            const {columns} = nextProps;
            return {
                visible: nextProps.visible,
                numRows: nextProps.pageSize,
                startRow: nextProps.offsetValue,
                selectedColumns: nextProps.allColumns,

                withSubkey: nextProps.columns.length >= 3,
                keyColumn: DownloadManager.hasColumn(columns, 'key') && 'key',
                valueColumn: DownloadManager.hasColumn(columns, 'value') && 'value',
                subkeyColumn: DownloadManager.hasColumn(columns, 'subkey') && 'subkey',
            };
        }

        return null;
    }

    constructor(props) {
        super(props);

        const {columns, visible, pageSize, offsetValue, allColumns} = props;

        this.state = {
            format: 'dsv',
            rowsMode: 'all',
            valueSentinel: '',
            ysonFormat: 'text',
            columnsMode: 'all',
            schemafulDsvMissingMode: 'fail',

            separators: {
                keyValue: '=',
                field: '\\t',
                record: '\\n',
            },

            encodeUtf: false,
            withHeaders: true,

            withSubkey: columns.length >= 3,
            keyColumn: DownloadManager.hasColumn(columns, 'key') && 'key',
            valueColumn: DownloadManager.hasColumn(columns, 'value') && 'value',
            subkeyColumn: DownloadManager.hasColumn(columns, 'subkey') && 'subkey',

            visible: visible,
            numRows: pageSize,
            startRow: offsetValue,
            selectedColumns: allColumns,

            excelExporter: false,
        };
    }

    getOutputFormat() {
        const {
            format,
            encodeUtf,
            ysonFormat,
            withSubkey,
            keyColumn,
            valueColumn,
            subkeyColumn,
            schemafulDsvMissingMode,
            valueSentinel,
            withHeaders,
            separators,
        } = this.state;

        const currentAttributes = {};
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

        if (format === 'yamr') {
            currentAttributes['lenval'] = false;
            currentAttributes['has_subkey'] = withSubkey;

            if (keyColumn) {
                currentAttributes['key'] = keyColumn;
            }

            if (valueColumn) {
                currentAttributes['value'] = valueColumn;
            }

            if (subkeyColumn && subkeyColumn) {
                currentAttributes['subkey'] = subkeyColumn;
            }
        }

        if (format === 'schemaful_dsv') {
            currentAttributes['missing_value_mode'] = schemafulDsvMissingMode;

            if (schemafulDsvMissingMode === 'print_sentinel') {
                currentAttributes['missing_value_sentinel'] = valueSentinel;
            }

            currentAttributes['enable_column_names_header'] = withHeaders;

            currentAttributes['columns'] = this.prepareColumnsForColumnMode(false);
        }

        const errors = [];

        const collectErrors = ({value, error}) => {
            if (error) {
                errors.push(error);
            }
            return value;
        };

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

            return '[#' + startRow + ':#' + (startRow + numRows) + ']';
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

    getDownloadParams() {
        const {transaction_id} = this.props;
        const {value: output_format, error} = this.getOutputFormat();
        const query = qs.stringify(
            Object.assign(
                {
                    path: this.downloadPath,
                    output_format,
                    dump_error_into_response: true,
                },
                transaction_id ? {transaction_id} : {},
            ),
        );
        return {query, error};
    }

    getDownloadLink() {
        const {cluster, proxy} = this.props;
        const base = allowDirectDownload()
            ? `//${proxy}/api/v3/read_table`
            : `/api/yt/${cluster}/api/v3/read_table`;

        const {query, error} = this.getDownloadParams();
        return {url: base + '?' + query, error};
    }

    getExcelDownloadLink() {
        const {cluster} = this.props;
        const base = `${EXCEL_BASE_URL}/${cluster}/api/export`;

        const {query, error} = this.getDownloadParams();

        return {url: base + '?' + query, error};
    }

    makeDocsUrl(path = '') {
        return docsUrl(UIFactory.docsUrls['storage:formats'] + path);
    }

    get formats() {
        const {isSchematicTable} = this.props;
        const {excelExporter} = this.state;

        return {
            dsv: {
                name: 'dsv',
                caption: 'TSKV',
                description:
                    'Tab-separated key-value format. ' +
                    'Please note that this format erases type information due to string conversion.',
                doc: this.makeDocsUrl('#dsv'),
                show: true,
            },
            schemaful_dsv: {
                name: 'schemaful_dsv',
                caption: 'Schemaful DSV',
                description: [
                    'Tab-separated format with fixed, ordered set of columns.',
                    'Please note that this format erases type information due to string conversion.',
                ].join(' '),
                doc: this.makeDocsUrl('#schemaful_dsv'),
                show: true,
            },
            yamr: {
                name: 'yamr',
                caption: 'YAMR',
                description:
                    'Legacy tab-separated format with fixed set of columns used in YAMR. ' +
                    'Please note that this format can only contain 2 or 3 columns, ' +
                    'columns named "key", "subkey" and "value" respectively are downloaded by default.',
                doc: this.makeDocsUrl('#yamr'),
                show: true,
            },
            yson: {
                name: 'yson',
                caption: 'YSON',
                description: 'Yet-another Serialized Object Notation.',
                doc: this.makeDocsUrl('#yson'),
                show: true,
            },
            json: {
                name: 'json',
                caption: 'JSON Lines',
                description:
                    'JSON Lines text format, also called newline-delimited JSON (JavaScript Serialized Object Notation).',
                doc: this.makeDocsUrl('#json'),
                show: true,
            },
            excel: {
                name: 'excel',
                caption: 'Excel',
                description: '',
                doc: docsUrl(UIFactory.docsUrls['storage:excel#skachivanie']),
                show: excelExporter && isSchematicTable,
            },
        };
    }

    get tabItems() {
        return _.map(_.values(this.formats), ({name, caption, show}) => ({
            value: name,
            text: caption,
            show,
        }));
    }

    changeFormat = (format) => this.setState({format});
    changeNumRows = (numRows) => this.setState({numRows});
    changeStartRow = (startRow) => this.setState({startRow});
    changeRowsMode = (rowsMode) => this.setState({rowsMode});
    changeKeyColumn = (keyColumn) => this.setState({keyColumn});
    changeYsonFormat = (ysonFormat) => this.setState({ysonFormat});
    changeValueColumn = (valueColumn) => this.setState({valueColumn});
    changeColumnsMode = (columnsMode) => this.setState({columnsMode});
    changeSubkeyColumn = (subkeyColumn) => this.setState({subkeyColumn});
    changeValueSentinel = (valueSentinel) => this.setState({valueSentinel});
    changeSelectedColumns = (selectedColumns) => this.setState({selectedColumns});
    changeSchemafulDsvMissingMode = (schemafulDsvMissingMode) =>
        this.setState({schemafulDsvMissingMode});

    toggleEncodeUtf = () => this.setState((prevState) => ({encodeUtf: !prevState.encodeUtf}));
    toggleWithSubkey = () => this.setState((prevState) => ({withSubkey: !prevState.withSubkey}));
    toggleWithHeaders = () => this.setState((prevState) => ({withHeaders: !prevState.withHeaders}));

    handleColumnsChange = ({items}) => this.changeSelectedColumns(items);
    handleRowsModeChange = (evt) => this.changeRowsMode(evt.target.value);
    handleYsonFormatChange = (evt) => this.changeYsonFormat(evt.target.value);
    handleColumnsModeChange = (evt) => this.changeColumnsMode(evt.target.value);
    handleSchemafulDsvMissingModeChange = (evt) =>
        this.changeSchemafulDsvMissingMode(evt.target.value);

    parseColumn(column, useQuotes) {
        const {showDecoded} = this.props;
        const parsedColumn = showDecoded ? unipika.decode(column) : column;

        // When forming the url address for reading a table we pass column names as
        // `read_table?path/to/file{"column1","column2"}` where they should be wrapped in quotes

        // In case of schemaful_dsv format column names are passed as part of request params as well. It looks like:
        // read_table?path/to/file{"Группа+клиентов","Ранг+оффера"}&output_format[$attributes][columns][]=Группа+клиентов&output_format[$attributes][columns][]=Ранг+оффера

        // [columns][]=Группа+клиентов -- valid,
        // [columns][]="Группа+клиентов" -- invalid

        if (useQuotes) {
            return `"${parsedColumn}"`;
        }

        return parsedColumn;
    }

    prepareColumnsForColumnMode(useQuotes = true) {
        const {columnsMode, selectedColumns} = this.state;

        if (columnsMode === 'all') {
            const preparedColumns = _.map(selectedColumns, 'name');

            return _.map(preparedColumns, (column) => this.parseColumn(column, useQuotes));
        } else if (columnsMode === 'custom') {
            const preparedColumns = _.reduce(
                selectedColumns,
                (columns, item) => {
                    if (item.checked) {
                        columns.push(item.name);
                    }

                    return columns;
                },
                [],
            );

            return _.map(preparedColumns, (column) => this.parseColumn(column, useQuotes));
        }
    }

    prepareYamrColumns() {
        const {columns} = this.props;

        return _.map(columns, ({name}) => {
            const column = this.parseColumn(name, false);
            return {
                value: column,
                title: column,
                name: column,
            };
        });
    }

    renderPaginator() {
        const {rowCount} = this.props;
        const {startRow, numRows} = this.state;

        const isStartRowEmpty = startRow === 0;
        const isNumRowsInvalid = typeof numRows !== 'number';
        const isStartRowInvalid = typeof startRow !== 'number';

        return (
            <Pagination
                showInput
                inputValue={String(startRow)}
                onChange={(value) => {
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
                        const row = Math.max(startRow - numRows, 0);
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

    renderRows() {
        const {rowsMode, numRows} = this.state;

        return (
            <Fragment>
                <div className="elements-form__label">Rows</div>
                <RadioButton
                    size="m"
                    value={rowsMode}
                    name="download-manager-row-mode"
                    onChange={this.handleRowsModeChange}
                    items={[
                        {value: 'all', text: 'All'},
                        {value: 'range', text: 'Range'},
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
                                autofocus={false}
                                value={String(numRows)}
                                invalid={isNaN(numRows) || numRows === ''}
                                onChange={(value) => {
                                    const num = DownloadManager.prepareValue(value);
                                    this.changeNumRows(num);
                                }}
                            />
                        </div>
                    </div>
                )}
            </Fragment>
        );
    }

    renderColumns() {
        const {columnsMode, format, selectedColumns} = this.state;
        const {srcColumns} = this.props;

        return (
            <Fragment>
                <div className="elements-form__label">Columns</div>
                <RadioButton
                    size="m"
                    value={columnsMode}
                    name="download-manager-columns-mode"
                    onChange={this.handleColumnsModeChange}
                    items={[
                        {value: 'all', text: 'All'},
                        {value: 'custom', text: 'Custom'},
                    ]}
                />

                {columnsMode === 'custom' && (
                    <ColumnSelector
                        isSortable={format === 'schemaful_dsv'}
                        className={block('columns-selector')}
                        onChange={this.handleColumnsChange}
                        items={selectedColumns}
                        srcItems={srcColumns}
                        isHeadless
                    />
                )}
            </Fragment>
        );
    }

    renderSchemafulDsv() {
        const {withHeaders, schemafulDsvMissingMode, valueSentinel} = this.state;

        return (
            <div className={block('schemaful-dsv')}>
                <div className="elements-form__field">
                    <div className="elements-form__label">Missing value mode</div>
                    <RadioButton
                        size="m"
                        value={schemafulDsvMissingMode}
                        name="download-manager-schemaful-dsv-mode"
                        onChange={this.handleSchemafulDsvMissingModeChange}
                        items={[
                            {value: 'fail', text: 'Fail'},
                            {value: 'skip_row', text: 'Skip row'},
                            {value: 'print_sentinel', text: 'Print sentinel'},
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

    setKeyValueSeparator = (v) => {
        this.onSeparatorChange('keyValue', v);
    };

    setFieldSeparator = (v) => {
        this.onSeparatorChange('field', v);
    };

    setRecordSeparator = (v) => {
        this.onSeparatorChange('record', v);
    };

    onSeparatorChange(separatorType, value) {
        this.setState({
            separators: {
                ...this.state.separators,
                [separatorType]: value,
            },
        });
    }

    renderYamr() {
        const {withSubkey} = this.state;
        const {columns} = this.props;

        return (
            <div className={block('with-subkey')}>
                <Checkbox
                    size="l"
                    checked={withSubkey}
                    disabled={columns.length < 3}
                    onChange={this.toggleWithSubkey}
                >
                    With subkey
                </Checkbox>
            </div>
        );
    }

    renderYamrColumns() {
        const {withSubkey, keyColumn, subkeyColumn, valueColumn} = this.state;

        return (
            <div className={block('yamr-columns')}>
                <div className="elements-form__field">
                    <div className="elements-form__label">Key</div>
                    <Select
                        value={keyColumn ? [keyColumn] : undefined}
                        onUpdate={(vals) => this.changeKeyColumn(vals[0])}
                        items={this.prepareYamrColumns()}
                        placeholder="Choose key column..."
                        hideFilter
                        width="max"
                    />
                </div>

                {withSubkey && (
                    <div className="elements-form__field">
                        <div className="elements-form__label">Subkey</div>
                        <Select
                            hideFilter
                            value={subkeyColumn ? [subkeyColumn] : undefined}
                            items={this.prepareYamrColumns()}
                            onUpdate={(vals) => this.changeSubkeyColumn(vals[0])}
                            placeholder="Choose subkey column..."
                            width="max"
                        />
                    </div>
                )}

                <div className="elements-form__field">
                    <div className="elements-form__label">Value</div>
                    <Select
                        hideFilter
                        value={valueColumn ? [valueColumn] : undefined}
                        onUpdate={(vals) => this.changeValueColumn(vals[0])}
                        items={this.prepareYamrColumns()}
                        placeholder="Choose value column..."
                        width="max"
                    />
                </div>
            </div>
        );
    }

    renderYson() {
        const {ysonFormat} = this.state;

        return (
            <div className={block('yson', 'elements-form__field')}>
                <div className="elements-form__label">Format</div>
                <RadioButton
                    size="m"
                    value={ysonFormat}
                    name="download-manager-yson-format"
                    onChange={this.handleYsonFormatChange}
                    items={[
                        {value: 'text', text: 'Text'},
                        {value: 'pretty', text: 'Pretty'},
                        {value: 'binary', text: 'Binary'},
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
                        <div className={block('shared-settings')}>
                            {this.renderRows()}
                            {format !== 'yamr' && this.renderColumns()}
                            {format === 'yamr' && this.renderYamr()}
                        </div>

                        <div className={block('type-settings')}>
                            {format === 'dsv' &&
                                this.renderSeparatorEditors({showKeyValueSeparator: true})}
                            {format === 'schemaful_dsv' && this.renderSchemafulDsv()}
                            {format === 'yamr' && this.renderYamrColumns()}
                            {format === 'json' && this.renderJson()}
                            {format === 'yson' && this.renderYson()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderConfirmButton = (className) => {
        const {format} = this.state;

        const {url, error} =
            format === 'excel' ? this.getExcelDownloadLink() : this.getDownloadLink();

        return (
            <Button
                size="m"
                type="link"
                view="action"
                className={className}
                title="Download"
                target="_blank"
                href={url}
                disabled={Boolean(error)}
            >
                Download
            </Button>
        );
    };

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
                <Button size="m" title="download" disabled={loading} onClick={this.showDialog}>
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
                        renderCustomConfirm={this.renderConfirmButton}
                    />
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {loading} = state.navigation.content.table;

    const pageSize = getRowsPerTablePage(state);
    const showDecoded = getShowDecoded(state);
    const offsetValue = getOffsetValue(state);
    const allColumns = getAllColumns(state);
    const srcColumns = getSrcColumns(state);
    const rowCount = getRowCount(state);
    const cluster = getCluster(state);
    const columns = getColumns(state);
    const schema = getSchema(state);
    const path = getPath(state);
    const {proxy} = getCurrentClusterConfig(state);
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
        transaction_id,
    };
};

export default compose(connect(mapStateToProps), withVisible)(DownloadManager);
