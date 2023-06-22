import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import hammer from '../../../common/hammer';

import Label from '../../../components/Label/Label';
import {Loader} from '@gravity-ui/uikit';
import {FormattedId} from '../../../components/formatters';
import MetaTable from '../../../components/MetaTable/MetaTable';
import ElementsTable from '../../../components/ElementsTable/ElementsTable';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';

import {abortAndReset, loadStoresData} from '../../../store/actions/tablet/stores';
import {TABLET_PARTITION_STORES_TABLE_ID} from '../../../constants/tablet';
import {storesTableItems} from '../../../utils/tablet/table';
import {getStores} from '../../../store/selectors/tablet/stores';

import './Stores.scss';

const block = cn('tablet-stores');

const PRELOAD_STATE_TO_THEME = {
    scheduled: 'warning',
    running: 'warning',
    complete: 'success',
    failed: 'danger',
};

const FLUSH_STATE_TO_THEME = {
    complete: 'success',
    none: 'success',
    running: 'warning',
};

function stateToTheme(state, theme) {
    return theme[state] || 'default';
}

class Stores extends Component {
    static propTypes = {
        // from parent
        index: PropTypes.number.isRequired,
        storesId: PropTypes.arrayOf(PropTypes.string).isRequired,
        stores: PropTypes.arrayOf(PropTypes.object).isRequired,

        // from connect
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,

        loadStoresData: PropTypes.func.isRequired,
        abortAndReset: PropTypes.func.isRequired,

        unorderedDynamicTable: PropTypes.bool,
    };

    static renderStoreState(state) {
        return typeof state !== 'undefined' ? (
            <Label theme="success" text={state} />
        ) : (
            hammer.format.NO_VALUE
        );
    }

    static renderPreloadState(state) {
        if (!state) {
            return hammer.format.NO_VALUE;
        }

        const theme = stateToTheme(state, PRELOAD_STATE_TO_THEME);
        return <Label theme={theme} text={state} />;
    }

    static renderFlushState(state) {
        if (!state) {
            return hammer.format.NO_VALUE;
        }

        const theme = stateToTheme(state, FLUSH_STATE_TO_THEME);
        return <Label theme={theme} text={state} />;
    }

    static renderAsId(store, columnName) {
        const id = storesTableItems[columnName].get(store);
        return <FormattedId id={id} />;
    }

    static renderAsState(store, columnName) {
        const state = storesTableItems[columnName].get(store);
        return Stores.renderStoreState(state);
    }

    static renderAsNumber(store, columnName) {
        const data = storesTableItems[columnName].get(store);
        return hammer.format['Number'](data);
    }

    static renderAsAttributes(store) {
        const dynamicStore = store.storeState.indexOf('dynamic') !== -1;
        const persistentStore = store.storeState.indexOf('persistent') !== -1;

        return (
            <MetaTable
                items={[
                    {
                        key: 'lock_count',
                        value: hammer.format['Number'](store.lockCount),
                        visible: dynamicStore,
                    },
                    {
                        key: 'value_count',
                        value: hammer.format['Number'](store.valueCount),
                        visible: dynamicStore,
                    },
                    {
                        key: 'pool_size',
                        value: hammer.format['Bytes'](store.poolSize),
                        visible: dynamicStore,
                    },
                    {
                        key: 'pool_capacity',
                        value: hammer.format['Bytes'](store.poolCapacity),
                        visible: dynamicStore,
                    },
                    {
                        key: 'flush_state',
                        value: Stores.renderFlushState(store.flushState),
                        visible: dynamicStore,
                    },

                    {
                        key: 'uncompressed_data_size',
                        value: hammer.format['Bytes'](store.uncompressed),
                        visible: persistentStore,
                    },
                    {
                        key: 'compressed_data_size',
                        value: hammer.format['Bytes'](store.compressed),
                        visible: persistentStore,
                    },
                    {
                        key: 'compaction_state',
                        value: Stores.renderFlushState(store.compactionState),
                        visible: persistentStore,
                    },
                    {
                        key: 'preload_state',
                        value: Stores.renderPreloadState(store.preloadState),
                        visible: persistentStore,
                    },
                ]}
            />
        );
    }

    componentDidMount() {
        const {index, storesId, loadStoresData, unorderedDynamicTable} = this.props;

        loadStoresData(storesId, index, unorderedDynamicTable);
    }

    componentDidUpdate(prevProps) {
        const {index, storesId, loadStoresData, unorderedDynamicTable} = this.props;

        if (prevProps.index !== index) {
            loadStoresData(storesId, index, unorderedDynamicTable);
        }
    }

    componentWillUnmount() {
        this.props.abortAndReset();
    }

    get tableSets() {
        return {
            default: {
                items: ['id', 'store_state', 'row_count', 'attributes'],
            },
        };
    }

    get tableSettings() {
        return {
            css: 'tablet-partitions-stores',
            theme: 'light',
            cssHover: true,
            striped: false,
            virtual: false,
            tableId: TABLET_PARTITION_STORES_TABLE_ID,
            columns: {
                items: storesTableItems,
                sets: this.tableSets,
                mode: 'default',
            },
            templates: {
                id: Stores.renderAsId,
                store_state: Stores.renderAsState,
                row_count: Stores.renderAsNumber,
                attributes: Stores.renderAsAttributes,
            },
            computeKey: function (store) {
                return store.$value;
            },
        };
    }

    render() {
        const {loading, loaded, error, errorData, stores} = this.props;

        return (
            <div className={block({loading})}>
                <ErrorBoundary>
                    <LoadDataHandler loaded={loaded} error={error} errorData={errorData}>
                        {loading ? (
                            <Loader />
                        ) : (
                            <ElementsTable {...this.tableSettings} items={stores} />
                        )}
                    </LoadDataHandler>
                </ErrorBoundary>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData} = state.tablet.stores;
    const stores = getStores(state);

    return {loading, loaded, error, errorData, stores};
};

const mapDispatchToProps = {
    loadStoresData,
    abortAndReset,
};

export default connect(mapStateToProps, mapDispatchToProps)(Stores);
