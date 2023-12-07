import React, {Component, Fragment} from 'react';
import {connect, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import MetaTable from '../../../../components/MetaTable/MetaTable';
import HelpLink from '../../../../components/HelpLink/HelpLink';
import Link from '../../../../components/Link/Link';
import {FormattedText} from '../../../../components/formatters';
import Filter from '../../../../components/Filter/Filter';
import Icon from '../../../../components/Icon/Icon';
import ErrorIcon from '../../../../components/ErrorIcon/ErrorIcon';
import SchemaDataType from '../../../../components/SchemaDataType/SchemaDataType';
import UIFactory from '../../../../UIFactory';
import {
    ExternalDescription,
    ExternalSchemaDescription,
} from './ExternalDescription/ExternalDescription';

import {
    getComputedColumns,
    getFilteredSchema,
    getSchema,
    getSchemaMeta,
} from '../../../../store/selectors/navigation/tabs/schema';
import {updateSchemaFilter} from '../../../../store/actions/navigation/tabs/schema';
import {getCluster} from '../../../../store/selectors/global';
import hammer from '../../../../common/hammer';

import './Schema.scss';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {getAttributesPath, getLoadState} from '../../../../store/selectors/navigation';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {docsUrl} from '../../../../config';
import {YTError} from '../../../../../@types/types';
import {RootState} from '../../../../store/reducers';

const block = cn('navigation-schema');
const elementsBlock = cn('elements-message');

const COLUMNS_TO_HIDE: Partial<Record<SchemaColumnNames, boolean>> = {
    required: true,
    type: true,
};

export type SchemaColumnNames = keyof SchemaItem | 'description';

export type SchemaProps = {
    cluster: string;
    column?: string;
    path: string;
    schema: Array<SchemaItem>;
    filteredSchema?: Array<SchemaItem>;
    meta: Array<SchemaMetaItem>;
    computedColumns: SchemaComputedColumns<SchemaColumnNames>;

    updateFilter: (filter: string) => void;
};

type SchemaItem = {
    index: number;
    name: string;
    required: boolean;
    type: string;
    type_v3: unknown;
};

type SchemaMetaItem = {
    value: 'strong' | boolean;
    key: 'schema_mode' | 'strict' | 'unique_keys' | string;
};

type SchemaComputedColumns<ColumnName extends string = string> = {
    items: Partial<Record<ColumnName, {caption: string; sort: boolean; align: 'left'}>>;
    set: Array<ColumnName>;
};

type SchemaState = {
    externalSchema?: Map<string, ExternalSchemaDescription>;
    externalSchemaUrl?: string;
    externalSchemaError?: YTError;
};

class Schema extends Component<SchemaProps> {
    state: SchemaState;

    constructor(props: SchemaProps) {
        super(props);
        this.state = {
            externalSchemaUrl: undefined,
            externalSchema: undefined,
            externalSchemaError: undefined,
        };
    }

    componentDidMount() {
        this.loadExternalSchemaData();
    }

    get templates() {
        const {externalSchema} = this.state;
        return {
            __default__(
                item: SchemaItem,
                column: Exclude<keyof SchemaItem, 'type_v3' | 'name' | 'required'>,
            ) {
                return <FormattedText text={item[column]} />;
            },
            name(item: Record<string, string>, column: string) {
                const {sort_order} = item;
                return (
                    <span>
                        {Boolean(sort_order) && (
                            <Icon
                                awesome={
                                    sort_order === 'descending'
                                        ? 'sort-amount-up'
                                        : 'sort-amount-down-alt'
                                }
                            />
                        )}
                        &nbsp;
                        <FormattedText text={item[column]} />
                    </span>
                );
            },
            required(item: SchemaItem) {
                const {required} = item;
                return (
                    <span>
                        {typeof required === 'boolean' ? String(required) : hammer.format.NO_VALUE}
                    </span>
                );
            },
            type_v3(item: SchemaItem) {
                const {type_v3} = item;
                return <SchemaDataType type_v3={type_v3} />;
            },
            description(item: SchemaItem) {
                const {type, name} = item;
                const descriptionData = externalSchema && externalSchema.get(name);
                return descriptionData ? (
                    <ExternalDescription type={type} data={descriptionData} />
                ) : null;
            },
        };
    }

    get tableSettings() {
        const {externalSchema, externalSchemaUrl, externalSchemaError} = this.state;
        const {items, set} = this.props.computedColumns;

        const preparedSet = set.filter((col) => !COLUMNS_TO_HIDE[col]);

        const preparedItems = _.omit(items, 'type_v2');

        if (externalSchema) {
            const caption =
                UIFactory.externalSchemaDescriptionSetup.caption || 'External description';
            _.assign(preparedItems, {
                description: {
                    caption: caption,
                    sort: false,
                    align: 'left',
                    render: () => (
                        <div className={block('description')}>
                            {caption}
                            {externalSchemaUrl ? (
                                <Link className={block('icon')} url={externalSchemaUrl}>
                                    <Icon awesome="external-link" />
                                </Link>
                            ) : null}
                            {externalSchemaError ? (
                                <ErrorIcon className={block('icon')} error={externalSchemaError} />
                            ) : null}
                        </div>
                    ),
                },
            });

            preparedSet.push('description');
        }

        return {
            templates: this.templates,
            columns: {
                items: preparedItems,
                sets: {
                    default: {
                        items: preparedSet,
                    },
                },
                mode: 'default',
            },
            virtualType: 'simple',
            theme: 'light',
            striped: false,
            computeKey(item: SchemaItem) {
                return item.name;
            },
        };
    }

    loadExternalSchemaData() {
        const {cluster, path} = this.props;
        UIFactory.externalSchemaDescriptionSetup
            .load(cluster, path)
            .then((res) => {
                const {url, externalSchema} = res;
                this.setState({
                    externalSchemaUrl: url,
                    externalSchema: externalSchema,
                });
            })
            .catch((err) => {
                this.setState({
                    externalSchema: new Map(),
                    externalSchemaError: err,
                });
            });
    }

    renderContent() {
        const {column, filteredSchema, updateFilter} = this.props;
        return (
            <Fragment>
                <Filter
                    placeholder="Filter by name..."
                    className={block('filter')}
                    onChange={updateFilter}
                    value={column ?? ''}
                    size="m"
                />

                <ElementsTable {...this.tableSettings} items={filteredSchema} css={block()} />
            </Fragment>
        );
    }

    renderPlaceholder() {
        return (
            <div className={elementsBlock({theme: 'warning'})}>
                <p className={elementsBlock('paragraph')}>Schema is empty.</p>
            </div>
        );
    }

    render() {
        const {meta, schema} = this.props;

        return (
            <div className={block()}>
                {docsUrl(
                    <div className={block('help')}>
                        <HelpLink url={UIFactory.docsUrls['storage:static_schema']} />
                    </div>,
                )}

                <MetaTable items={meta} />

                {schema?.length > 0 ? this.renderContent() : this.renderPlaceholder()}
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    const {column} = state.navigation.tabs.schema;

    const cluster = getCluster(state);
    const path = getAttributesPath(state);
    const schema = getSchema(state);
    const meta = getSchemaMeta(state);
    const filteredSchema = getFilteredSchema(state);
    const computedColumns = getComputedColumns(state);

    return {column, meta, schema, filteredSchema, computedColumns, cluster, path};
};

const mapDispatchToProps = {
    updateFilter: updateSchemaFilter,
};

const SchemaConnected = connect(mapStateToProps, mapDispatchToProps)(Schema);

export default function SchemaWithRum() {
    const loadState = useSelector(getLoadState);
    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_TAB_SCHEMA,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_TAB_SCHEMA,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });
    return <SchemaConnected />;
}
