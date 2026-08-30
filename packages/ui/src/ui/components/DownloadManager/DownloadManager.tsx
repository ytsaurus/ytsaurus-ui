import React from 'react';
import unipika from '../../common/thor/unipika';
import cn from 'bem-cn-lite';

import filter_ from 'lodash/filter';
import find_ from 'lodash/find';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';
import values_ from 'lodash/values';

import axios from 'axios';

import {Checkbox, SegmentedRadioGroup, TextInput} from '@gravity-ui/uikit';

import ColumnSelector from '../ColumnSelector/ColumnSelector';
import Pagination from '../Pagination/Pagination';
import HelpLink from '../HelpLink/HelpLink';
import Filter from '../Filter/Filter';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import Icon from '../Icon/Icon';
import Link from '../../containers/Link/Link';
import Tabs from '../Tabs/Tabs';

import {type WithVisibleProps} from '../../hocs/withVisible';

import './DownloadManager.scss';
import {docsUrl, getExportTableBaseUrl} from '../../config';
import i18n from './i18n';
import SeparatorInput, {prepareSeparatorValue} from './SeparatorInput';
import UIFactory from '../../UIFactory';
import {type FIX_MY_TYPE} from '../../types';

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

type Props = WithVisibleProps & {
    className?: string;
    loading: boolean;
    cluster: string;
    pageSize: number;
    offsetValue: number;
    rowCount: number;
    allColumns: Array<{name: string; checked: boolean}>;
    srcColumns: Array<{name: string; checked: boolean}>;
    columns: Array<{name: string; checked: boolean}>;
    showDecoded: boolean;
    isSchematicTable: boolean;
    downloadFile: (url: string, filename: string) => Promise<void>;
    downloadToClipboard?: (url: string, filename: string) => Promise<void>;
};

type DownloadFormat = 'dsv' | 'schemaful_dsv' | 'csv' | 'yson' | 'json' | 'excel';

type State = {
    format: DownloadFormat;
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

const CSV_SEPARATORS: State['separators'] = {
    record: '\n',
    field: ',',
};

const FILE_EXTENSION_BY_FORMAT: Record<DownloadFormat, string> = {
    dsv: '.tskv',
    schemaful_dsv: '.dsv',
    csv: '.csv',
    yson: '.yson',
    json: '.json',
    excel: '.xlsx',
};

export abstract class DownloadManager<ExtraProps extends object = object> extends React.Component<
    Props & ExtraProps,
    State
> {
    static prepareValue(value: string): number | string {
        const parsedValue = Number(String(value).replace(/\s/g, '') || undefined); // we need `|| undefined` cause Number('') === 0
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

    constructor(props: Props & ExtraProps) {
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
            filename: this.getDefaultFilename(),

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

    componentDidUpdate(prevProps: Props) {
        if (this.props.visible && !prevProps.visible) {
            this.setState({filename: this.getDefaultFilename()});
        }
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
            $value: format === 'csv' ? 'schemaful_dsv' : format,
            $attributes: currentAttributes,
        };

        if (format === 'json') {
            currentAttributes['encode_utf8'] = encodeUtf;
        }

        if (format === 'yson') {
            currentAttributes['format'] = ysonFormat;
        }

        if (format === 'schemaful_dsv' || format === 'csv') {
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
        } else if (format === 'csv') {
            currentAttributes['field_separator'] = CSV_SEPARATORS.field;
            currentAttributes['record_separator'] = CSV_SEPARATORS.record;
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
                    : {inner_errors: errors, message: i18n('alert_output-format-errors')},
        };
    }

    abstract getDefaultFilename(): string;

    abstract getDownloadParams(): {
        query: string;
        error?: {inner_errors: string[]; message: string};
    };

    abstract getDownloadLink(): {
        url: string;
        error?: {inner_errors: string[]; message: string};
    };

    getDownloadFilename() {
        const {format, filename} = this.state;

        const name = filename.trim() || this.getDefaultFilename();
        const extension = FILE_EXTENSION_BY_FORMAT[format];

        return name.toLowerCase().endsWith(extension) ? name : `${name}${extension}`;
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
                get description() {
                    return i18n('context_dsv-description');
                },
                doc: this.makeDocsUrl('#dsv'),
                show: true,
            },
            schemaful_dsv: {
                name: 'schemaful_dsv' as const,
                caption: 'Schemaful DSV',
                get description() {
                    return i18n('context_schemaful-dsv-description');
                },
                doc: this.makeDocsUrl('#schemaful_dsv'),
                show: true,
            },
            csv: {
                name: 'csv' as const,
                caption: 'CSV',
                get description() {
                    return i18n('context_csv-description');
                },
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
                get description() {
                    return i18n('context_json-description');
                },
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

    changeFormat = (format: DownloadFormat) => this.setState({format});
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
                <div className={block('filename-form__label')}>{i18n('field_filename')}</div>
                <TextInput size="m" value={filename} onUpdate={this.changeFilename} />
            </div>
        );
    }

    renderRows() {
        const {rowsMode, numRows} = this.state;

        return (
            <React.Fragment>
                <div className="elements-form__label">{i18n('field_rows')}</div>
                <SegmentedRadioGroup
                    size="m"
                    className="elements-form__field"
                    value={rowsMode}
                    name="download-manager-row-mode"
                    onUpdate={(value) => this.changeRowsMode(value)}
                    options={[
                        {
                            value: 'all',
                            get content() {
                                return i18n('value_all');
                            },
                        },
                        {
                            value: 'range',
                            get content() {
                                return i18n('value_range');
                            },
                        },
                    ]}
                />

                {rowsMode === 'range' && (
                    <div className={block('rows')}>
                        <div className="elements-form__field">
                            <div className="elements-form__label">{i18n('field_start-row')}</div>
                            {this.renderPaginator()}
                        </div>

                        <div className="elements-form__field">
                            <div className="elements-form__label">
                                {i18n('field_number-of-rows')}
                            </div>
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
                <div className="elements-form__label">{i18n('field_columns')}</div>
                <SegmentedRadioGroup
                    size="m"
                    className="elements-form__field"
                    value={columnsMode}
                    name="download-manager-columns-mode"
                    onUpdate={(value) => this.changeColumnsMode(value)}
                    options={[
                        {
                            value: 'all',
                            get content() {
                                return i18n('value_all');
                            },
                        },
                        {
                            value: 'custom',
                            get content() {
                                return i18n('value_custom');
                            },
                        },
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

    renderSchemafulDsv({fixedSeparators}: {fixedSeparators?: State['separators']} = {}) {
        const {withHeaders, schemafulDsvMissingMode, valueSentinel} = this.state;

        return (
            <div className={block('schemaful-dsv')}>
                <div className="elements-form__field">
                    <div className="elements-form__label">{i18n('field_missing-value-mode')}</div>
                    <SegmentedRadioGroup
                        size="m"
                        value={schemafulDsvMissingMode}
                        name="download-manager-schemaful-dsv-mode"
                        onUpdate={(value) => this.changeSchemafulDsvMissingMode(value)}
                        options={[
                            {
                                value: 'fail',
                                get content() {
                                    return i18n('value_fail');
                                },
                            },
                            {
                                value: 'skip_row',
                                get content() {
                                    return i18n('value_skip-row');
                                },
                            },
                            {
                                value: 'print_sentinel',
                                get content() {
                                    return i18n('value_print-sentinel');
                                },
                            },
                        ]}
                    />
                </div>

                {schemafulDsvMissingMode === 'print_sentinel' && (
                    <div className="elements-form__field">
                        <div className="elements-form__label">
                            {i18n('field_missing-value-sentinel')}
                        </div>
                        <TextInput
                            size="m"
                            value={valueSentinel}
                            onUpdate={this.changeValueSentinel}
                            placeholder={i18n('context_sentinel-placeholder')}
                        />
                    </div>
                )}

                <Checkbox size="l" checked={withHeaders} onChange={this.toggleWithHeaders}>
                    {i18n('context_prepend-column-names-header')}
                </Checkbox>
                {this.renderSeparatorEditors({fixedSeparators})}
            </div>
        );
    }

    renderSeparatorEditors({
        showKeyValueSeparator = false,
        fixedSeparators,
    }: {showKeyValueSeparator?: boolean; fixedSeparators?: State['separators']} = {}) {
        const {keyValue, field, record} = {...this.state.separators, ...fixedSeparators};

        return (
            <div className={block('dsv-separators')}>
                {showKeyValueSeparator && (
                    <div className={block('dsv-separators-item')}>
                        <div className={'elements-form__label'}>
                            {i18n('field_key-value-separator')}
                        </div>
                        <SeparatorInput
                            value={keyValue}
                            onChange={this.setKeyValueSeparator}
                            disabled={fixedSeparators?.keyValue !== undefined}
                        />
                    </div>
                )}
                <div className={block('dsv-separators-item')}>
                    <div className={'elements-form__label'}>{i18n('field_field-separator')}</div>
                    <SeparatorInput
                        value={field}
                        onChange={this.setFieldSeparator}
                        disabled={fixedSeparators?.field !== undefined}
                    />
                </div>
                <div className={block('dsv-separators-item')}>
                    <div className={'elements-form__label'}>{i18n('field_record-separator')}</div>
                    <SeparatorInput
                        value={record}
                        onChange={this.setRecordSeparator}
                        disabled={fixedSeparators?.record !== undefined}
                    />
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
                <div className="elements-form__label">{i18n('field_format')}</div>
                <SegmentedRadioGroup
                    size="m"
                    value={ysonFormat}
                    name="download-manager-yson-format"
                    onUpdate={(value) => this.changeYsonFormat(value)}
                    options={[
                        {
                            value: 'text',
                            get content() {
                                return i18n('value_text');
                            },
                        },
                        {
                            value: 'pretty',
                            get content() {
                                return i18n('value_pretty');
                            },
                        },
                        {
                            value: 'binary',
                            get content() {
                                return i18n('value_binary');
                            },
                        },
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
                    {i18n('context_encode-utf8')}
                </Checkbox>
            </div>
        );
    }

    renderExcel() {
        const {number_precision_mode: excelNumberPrecisionMode} = this.state;
        return (
            <React.Fragment>
                <div className="elements-form__label">{i18n('field_number-precision-mode')}</div>
                <SegmentedRadioGroup
                    size="m"
                    value={excelNumberPrecisionMode}
                    onUpdate={(v) => this.setState({number_precision_mode: v})}
                    options={[
                        {
                            value: 'string' as const,
                            get content() {
                                return i18n('value_string');
                            },
                        },
                        {
                            value: 'error' as const,
                            get content() {
                                return i18n('value_error');
                            },
                        },
                        {
                            value: 'lose' as const,
                            get content() {
                                return i18n('value_lose');
                            },
                        },
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
                    {i18n('alert_download-error-appended')}{' '}
                    {docsUrl(
                        <>
                            {i18n('alert_see-faq-for-details')} {faqLink}{' '}
                            {i18n('alert_see-faq-for-details-after')}
                        </>,
                    )}
                </div>
                <div className={messageBlock({theme: 'warning'})}>
                    {i18n('alert_not-production-ready')} {docsUrl(cliLink, 'CLI')}{' '}
                    {i18n('alert_not-production-ready-after')}
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
                            {format === 'csv' &&
                                this.renderSchemafulDsv({fixedSeparators: CSV_SEPARATORS})}
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
        const {downloadToClipboard} = this.props;

        if (!downloadToClipboard) {
            return null;
        }

        const filename = this.getDownloadFilename();
        const {url, error} = this.getDownloadLink();

        const title = i18n('action_download-to-clipboard');

        return (
            <Button
                size="m"
                title={title}
                disabled={Boolean(error)}
                qa="download-to-clipboard-static-table"
                onClick={() => {
                    downloadToClipboard(url, filename);
                }}
            >
                {title}
            </Button>
        );
    }

    renderModalConfirmButton = (classNameConfirm: string) => {
        const filename = this.getDownloadFilename();
        const {url, error} = this.getDownloadLink();

        const title = i18n('action_download');

        const handleDownload = () => {
            this.props.downloadFile(url, filename);
        };

        return (
            <Button
                className={classNameConfirm}
                size="m"
                title={title}
                disabled={Boolean(error)}
                view="action"
                qa="download-static-table"
                onClick={handleDownload}
            >
                {title}
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
                    title={i18n('action_download')}
                    disabled={loading}
                    onClick={this.showDialog}
                    qa={'show-download-static-table'}
                >
                    <Icon awesome="download" size={13} />
                    &nbsp; {i18n('action_download')}
                </Button>

                {visible && (
                    <Modal
                        size="l"
                        title={i18n('title_download')}
                        visible={visible}
                        onCancel={handleClose}
                        confirmText={i18n('action_download')}
                        content={this.renderContent()}
                        footerContent={this.renderModalCopyButton()}
                        renderCustomConfirm={this.renderModalConfirmButton}
                    />
                )}
            </div>
        );
    }
}
