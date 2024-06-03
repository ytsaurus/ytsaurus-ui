import React from 'react';
import {ConnectedProps, connect} from 'react-redux';
import unipika from '../../../../../common/thor/unipika';
import {compose} from 'redux';
import cn from 'bem-cn-lite';
import _ from 'lodash';
import qs from 'qs';
import axios from 'axios';

import {Checkbox, RadioButton, TextInput} from '@gravity-ui/uikit';

import ColumnSelector from '../../../../../components/ColumnSelector/ColumnSelector';
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
import withVisible, {WithVisibleProps} from '../../../../../hocs/withVisible';
import {
    getAllColumns,
    getOffsetValue,
    getRowCount,
    getSrcColumns,
} from '../../../../../store/selectors/navigation/content/table';
import {getColumns} from '../../../../../store/selectors/navigation/content/table-ts';

import './DownloadManager.scss';
import {docsUrl} from '../../../../../config';
import {uiSettings} from '../../../../../config/ui-settings';
import SeparatorInput, {prepareSeparatorValue} from './SeparatorInput';
import UIFactory from '../../../../../UIFactory';
import {makeDirectDownloadPath} from '../../../../../utils/navigation';
import {RootState} from '../../../../../store/reducers';
import {FIX_MY_TYPE} from '../../../../../types';

const block = cn('table-download-manager');
const messageBlock = cn('elements-message');

const EXCEL_BASE_URL = uiSettings?.exportTableBaseUrl;

function checkExcelExporter(cluster: string) {
    if (!EXCEL_BASE_URL) {
        return Promise.resolve(false);
    }

    return axios
        .get(`${EXCEL_BASE_URL}/${cluster}/api/ready`)
        .then(() => true)
        .catch(() => false);
}

type ReduxProps = Omit<ConnectedProps<typeof connector>, 'dispatch'>;
type Props = ReduxProps & WithVisibleProps & {className?: string};

type State = {
    format: 'dsv' | 'schemaful_dsv' | 'yamr' | 'yson' | 'json' | 'excel';
    visible?: boolean;
    excelExporter: boolean;
    rowsMode: 'range' | 'all';
    startRow: string | number;
    numRows: string | number;
    valueSentinel: string;
    ysonFormat: 'text' | 'pretty' | 'binary';
    columnsMode: 'all' | 'custom';

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
        return _.filter(columns, ({checked}) => checked);
    }

    static hasColumn(columns: Array<{name?: string}>, name: string) {
        return Boolean(_.find(columns, (column) => column.name === name));
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
            withSubkey,
            keyColumn,
            valueColumn,
            subkeyColumn,
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
        const {cluster, proxy, externalProxy} = this.props;
        const base = makeDirectDownloadPath('read_table', {cluster, proxy, externalProxy});
        const {query, error} = this.getDownloadParams();
        return {url: base + '?' + query, error};
    }

    getExcelDownloadLink() {
        const {cluster} = this.props;
        const base = `${EXCEL_BASE_URL}/${cluster}/api/export`;

        const {query, error} = this.getDownloadParams();
        const {number_precision_mode} = this.state;
        const params = new URLSearchParams({number_precision_mode});

        return {url: `${base}?${params}&${query}`, error};
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
            yamr: {
                name: 'yamr' as const,
                caption: 'YAMR',
                description:
                    'Legacy tab-separated format with fixed set of columns used in YAMR. ' +
                    'Please note that this format can only contain 2 or 3 columns, ' +
                    'columns named "key", "subkey" and "value" respectively are downloaded by default.',
                doc: this.makeDocsUrl('#yamr'),
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
        return _.map(_.values(this.formats), ({name, caption, show}) => ({
            value: name,
            text: caption,
            show,
        }));
    }

    changeFormat = (format: State['format']) => this.setState({format});
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
                [] as Array<string>,
            );

            return _.map(preparedColumns, (column) => this.parseColumn(column, useQuotes));
        }
        return undefined;
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

    renderRows() {
        const {rowsMode, numRows} = this.state;

        return (
            <React.Fragment>
                <div className="elements-form__label">Rows</div>
                <RadioButton
                    size="m"
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
                <RadioButton
                    size="m"
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
                    <RadioButton
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
                <RadioButton
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
                            {format === 'excel' && this.renderExcel()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderConfirmButton = (className: string) => {
        const {format} = this.state;

        const {url, error} =
            format === 'excel' ? this.getExcelDownloadLink() : this.getDownloadLink();

        return (
            <Button
                size="m"
                view="action"
                className={className}
                title="Download"
                target="_blank"
                href={url}
                disabled={Boolean(error)}
                qa="download-static-table"
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
                        renderCustomConfirm={this.renderConfirmButton}
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
const connector = connect(mapStateToProps);
export default compose(connector, withVisible)(DownloadManager);
