import React, {Component, Fragment} from 'react';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
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
import {ExternalDescription} from './ExternalDescription/ExternalDescription';

import {
    getSchema,
    getFilteredSchema,
    getSchemaMeta,
    getComputedColumns,
} from '../../../../store/selectors/navigation/tabs/schema';
import {updateFilter} from '../../../../store/actions/navigation/tabs/schema';
import {getCluster} from '../../../../store/selectors/global';
import hammer from '../../../../common/hammer';

import './Schema.scss';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {getLoadState, getAttributesPath} from '../../../../store/selectors/navigation';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {docsUrl} from '../../../../config';

const block = cn('navigation-schema');
const elementsBlock = cn('elements-message');

const COLUMNS_TO_HIDE = {
    required: true,
    type: true,
};

class Schema extends Component {
    static schemaProps = PropTypes.arrayOf(
        PropTypes.shape({
            index: PropTypes.number.isRequired,
            type: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            required: PropTypes.bool.isRequired,
            type_v3: PropTypes.oneOfType([
                PropTypes.string.isRequired,
                PropTypes.object.isRequired,
            ]),
        }),
    );

    static propTypes = {
        // from connect
        path: PropTypes.string.isRequired,
        cluster: PropTypes.string.isRequired,
        column: PropTypes.string.isRequired,
        meta: PropTypes.arrayOf(MetaTable.itemProps).isRequired,
        schema: Schema.schemaProps.isRequired,
        filteredSchema: Schema.schemaProps.isRequired,
        computedColumns: PropTypes.shape({
            set: PropTypes.arrayOf(PropTypes.string).isRequired,
            items: PropTypes.object.isRequired,
        }).isRequired,

        updateFilter: PropTypes.func.isRequired,
    };

    constructor(props) {
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
            __default__(item, column) {
                return <FormattedText text={item[column]} />;
            },
            name(item, column) {
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
            required(item, column) {
                const required = item[column];
                return (
                    <span>
                        {typeof required === 'boolean' ? String(required) : hammer.format.NO_VALUE}
                    </span>
                );
            },
            type_v3(item, column) {
                const schemaV3 = item[column];
                return <SchemaDataType type_v3={schemaV3} />;
            },
            description(item) {
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
            computeKey(item) {
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
                    value={column}
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

                {schema.length > 0 ? this.renderContent() : this.renderPlaceholder()}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
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
    updateFilter,
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
