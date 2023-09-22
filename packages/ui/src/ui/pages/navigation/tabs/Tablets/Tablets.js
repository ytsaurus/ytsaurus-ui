import {Sticky, StickyContainer} from 'react-sticky';
import React, {Component, Fragment} from 'react';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import ClickableAttributesButton from '../../../../components/AttributesButton/ClickableAttributesButton';
import CollapsibleSection from '../../../../components/CollapsibleSection/CollapsibleSection';
import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import RadioButton from '../../../../components/RadioButton/RadioButton';
import {Loader, Progress} from '@gravity-ui/uikit';
import Histogram from '../../../../components/Histogram/Histogram';
import Filter from '../../../../components/Filter/Filter';
import Label from '../../../../components/Label/Label';
import Link from '../../../../components/Link/Link';
import Button from '../../../../components/Button/Button';
import Icon from '../../../../components/Icon/Icon';

import {getPath, getType} from '../../../../store/selectors/navigation';

import {
    getActiveHistogram,
    getHistogram,
    getNavigationTabletsLoadingStatus,
    getTablets,
} from '../../../../store/selectors/navigation/tabs/tablets';

import {NAVIGATION_TABLETS_TABLE_ID} from '../../../../constants/navigation/tabs/tablets';
import {HEADER_HEIGHT, Page} from '../../../../constants/index';

import {
    abortAndReset,
    changeActiveHistogram,
    changeTabletsFilter,
    changeTabletsMode,
    loadTablets,
    toggleExpandedHost,
    toggleHistogram,
} from '../../../../store/actions/navigation/tabs/tablets';

import {histogramItems, tableItems} from '../../../../utils/navigation/tabs/tables';
import {asNumber} from '../../../../components/templates/utils';
import hammer from '../../../../common/hammer';
import ypath from '../../../../common/thor/ypath';
import unipika from '../../../../common/thor/unipika';

import {genTabletCellBundlesCellUrl} from '../../../../utils/tablet_cell_bundles';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {getUISizes} from '../../../../store/selectors/global';
import {Host} from '../../../../containers/Host/Host';
import {
    getTabletsByName,
    getTabletsMax,
} from '../../../../store/selectors/navigation/tabs/tablets-ts';
import {getProgressBarColorByIndex} from '../../../../constants/colors';

import './Tablets.scss';

const block = cn('navigation-tablets');

class Tablets extends Component {
    static typedValueProps = PropTypes.shape({
        $type: PropTypes.string.isRequired,
        $value: PropTypes.string.isRequired,
    });

    static tabletProps = PropTypes.shape({
        index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

        cell_id: PropTypes.string,
        error_count: PropTypes.number,
        last_commit_timestamp: PropTypes.number,
        replication_error_count: PropTypes.number,
        state: PropTypes.string,
        tablet_id: PropTypes.string,

        performance_counters: PropTypes.object,
        statistics: PropTypes.object,

        pivot_key: PropTypes.arrayOf(Tablets.typedValueProps),
    });

    static propTypes = {
        // from connect
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object.isRequired,

        path: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        tabletsMode: PropTypes.string.isRequired,
        tabletsFilter: PropTypes.string.isRequired,
        activeHistogram: PropTypes.string.isRequired,
        histogramCollapsed: PropTypes.bool.isRequired,
        tablets: PropTypes.arrayOf(Tablets.tabletProps).isRequired,
        histogram: PropTypes.shape({
            data: PropTypes.array.isRequired,
            format: PropTypes.string.isRequired,
            dataName: PropTypes.string.isRequired,
            dataFormat: PropTypes.string.isRequired,
        }).isRequired,

        loadTablets: PropTypes.func.isRequired,
        abortAndReset: PropTypes.func.isRequired,
        toggleHistogram: PropTypes.func.isRequired,
        changeTabletsMode: PropTypes.func.isRequired,
        changeTabletsFilter: PropTypes.func.isRequired,
        changeActiveHistogram: PropTypes.func.isRequired,
    };

    static prepareStorePreloadProgress(storePreload) {
        const completed = storePreload?.completed || 0;
        const failed = storePreload?.failed || 0;
        const pending = storePreload?.pending || 0;
        const total = completed + failed + pending;

        return {
            text: hammer.format['Number'](completed) + ' / ' + hammer.format['Number'](total),
            value: total > 0 ? ((failed + completed) / total) * 100 : 0,
            stack: [
                {
                    value: total > 0 ? (completed / total) * 100 : 0,
                    theme: 'info',
                },
                {
                    value: total > 0 ? (failed / total) * 100 : 0,
                    theme: 'danger',
                },
            ],
        };
    }

    static rowClassName(item) {
        const {level} = item;
        return block('row', {top: level === 0});
    }

    static renderName(item) {
        const {name, level, isCollapsed, cell_leader_address} = item;
        const content =
            level === 0 ? (
                <React.Fragment>
                    <Button view={'flat-secondary'}>
                        <Icon awesome={isCollapsed ? 'angle-down' : 'angle-up'} />
                    </Button>{' '}
                    {name === cell_leader_address
                        ? Tablets.renderHost(item)
                        : Tablets.renderCellId(item)}
                </React.Fragment>
            ) : (
                Tablets.renderTabletId(item)
            );

        return <div className={block('name', {level})}>{content}</div>;
    }

    static isTopLevel(item) {
        const {level, name, cell_leader_address, cell_id} = item;
        return level === 0 && (name === cell_leader_address || name === cell_id);
    }

    static renderIndex(item, columnName) {
        if (Tablets.isTopLevel(item) && item.childrenCount) {
            return `(total ${item.childrenCount})`;
        }
        if (Tablets)
            if (item.index === 'aggregation') {
                return hammer.format['ReadableField'](item.index);
            } else {
                return hammer.format['Number'](item[columnName]);
            }
    }

    static renderTabletId(item) {
        const id = item.tablet_id;
        const url = `${Page.TABLET}/${id}`;

        return Tablets.renderIdWithLink(id, url);
    }

    static renderCellId(item) {
        const id = item.cell_id;
        const url = genTabletCellBundlesCellUrl(id);

        return Tablets.renderIdWithLink(id, url);
    }

    static renderHost(item) {
        const host = item.cell_leader_address;
        return <Host asTabletNode address={host} copyBtnClassName={block('copy-btn')} />;
    }

    static renderIdWithLink(id, url) {
        return id ? (
            <div className={block('id-link')}>
                <Link url={url}>{id}</Link>
                <ClipboardButton className={block('copy-btn')} view={'flat-secondary'} text={id} />
            </div>
        ) : (
            hammer.format.NO_VALUE
        );
    }

    static renderState(item, columnName) {
        const state = item[columnName];
        const theme = {
            none: 'default',
            unmounted: 'default',
            mounted: 'info',
            frozen: 'info',
            freezing: 'warning',
            unfreezing: 'warning',
            mounting: 'warning',
            unmounting: 'warning',
            mixed: 'danger',
        }[state];

        return typeof state !== 'undefined' ? (
            <Label theme={theme} text={state} />
        ) : (
            hammer.format.NO_VALUE
        );
    }

    static renderPivotKey(item, columnName) {
        const pivotKey = item[columnName];

        const text = unipika.prettyprint(pivotKey, {
            break: false,
            indent: 0,
            asHTML: false,
        });
        const title = text.split(',').join(',\n');

        return typeof pivotKey !== 'undefined' ? (
            <div className="elements-column_with-hover-button unipika navigation-tablets__pivot-key">
                [
                <span title={title} className="uint64 elements-ellipsis">
                    {text.slice(1, -1)}
                </span>
                ]
                <ClipboardButton
                    text={text}
                    view="flat-secondary"
                    size="s"
                    title="Copy Pivot Key"
                />
            </div>
        ) : (
            hammer.format.NO_VALUE
        );
    }

    static renderActions(item) {
        if (item.index === 'aggregation' || Tablets.isTopLevel(item)) {
            return null;
        } else {
            const tablet = ypath.getValue(item, '/tablet_id');

            return (
                <ClickableAttributesButton
                    title={item.tablet_id}
                    path={`//sys/tablets/${tablet}`}
                    withTooltip
                />
            );
        }
    }

    static renderStorePreload(item, columnName) {
        const storePreload = item[columnName];
        const storePreloadProgress = Tablets.prepareStorePreloadProgress(storePreload);

        return <Progress {...storePreloadProgress} />;
    }

    componentDidMount() {
        this.props.loadTablets();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.path !== this.props.path) {
            this.props.loadTablets();
        }
    }

    componentWillUnmount() {
        this.props.abortAndReset();
    }

    get defaultItems() {
        const {type} = this.props;

        const newDefaultItemsForReplicatedTable = [
            'index',
            'tablet_id',
            'cell_leader_address',
            'state',
            'cell_id',
            'error_count',
            'replication_error_count',
            'pivot_key',
            'actions',
        ];
        const newDefaultItemsForTable = [
            'index',
            'tablet_id',
            'cell_leader_address',
            'state',
            'cell_id',
            'error_count',
            'pivot_key',
            'actions',
        ];

        const newDefaultItems =
            type === 'replicated_table'
                ? newDefaultItemsForReplicatedTable
                : newDefaultItemsForTable;

        return newDefaultItems;
    }

    get tableSets() {
        return {
            default: {
                items: this.defaultItems,
            },
            data: {
                items: [
                    'index',
                    'tablet_id',
                    'cell_leader_address',
                    'unmerged_row_count',
                    'uncompressed_data_size',
                    'compressed_data_size',
                    'disk_space',
                    'actions',
                ],
            },
            structure: {
                items: [
                    'index',
                    'tablet_id',
                    'cell_leader_address',
                    'chunk_count',
                    'partition_count',
                    'store_count',
                    'overlapping_store_count',
                    'store_preload',
                    'actions',
                ],
            },
            performance: {
                items: [
                    'index',
                    'cell_leader_address',
                    'dynamic',
                    'static_chunk',
                    'unmerged_row_read_rate',
                    'merged_row_read_rate',
                    'actions',
                ],
            },
            by_host: {
                items: [
                    'name_tablet_id',
                    'index',
                    'unmerged_row_count',
                    'uncompressed_data_size',
                    'compressed_data_size',
                    'disk_space',
                    'actions',
                ],
            },
            by_cell: {
                items: [
                    'name_cell_id',
                    'index',
                    'unmerged_row_count',
                    'uncompressed_data_size',
                    'compressed_data_size',
                    'disk_space',
                    'actions',
                ],
            },
        };
    }

    get tableSettings() {
        const {tabletsMode} = this.props;

        return {
            css: block(),
            theme: 'light',
            cssHover: true,
            striped: false,
            tableId: NAVIGATION_TABLETS_TABLE_ID,
            columns: {
                items: tableItems,
                sets: this.tableSets,
                mode: tabletsMode,
            },
            templates: {
                name_tablet_id: Tablets.renderName,
                name_cell_id: Tablets.renderName,
                index: Tablets.renderIndex,
                tablet_id: Tablets.renderTabletId,
                cell_id: Tablets.renderCellId,
                cell_leader_address: Tablets.renderHost,
                state: Tablets.renderState,
                pivot_key: Tablets.renderPivotKey,
                actions: Tablets.renderActions,
                store_preload: Tablets.renderStorePreload,
                error_count: asNumber,
                replication_error_count: asNumber,
                chunk_count: asNumber,
                partition_count: asNumber,
                store_count: asNumber,
                overlapping_store_count: asNumber,
                unmerged_row_count: this.renderNumberProgress,
                uncompressed_data_size: this.renderBytesProgress,
                compressed_data_size: this.renderBytesProgress,
                disk_space: this.renderBytesProgress,
                static_chunk_read: asNumber,
                static_chunk_lookup: asNumber,
                dynamic_read: asNumber,
                dynamic_lookup: asNumber,
                dynamic_write: asNumber,
                dynamic_delete: asNumber,
                unmerged_row_read_rate: asNumber,
                merged_row_read_rate: asNumber,
            },
            computeKey(item) {
                return item.name || item.tablet_id;
            },
            itemMods(tablet) {
                return (
                    tablet.index === 'aggregation' && {
                        aggregation: 'yes',
                    }
                );
            },
        };
    }

    renderProgress = (item, column, useBytes) => {
        const {maxByLevel = []} = this.props;
        const {level = 0, [column]: value, index} = item;
        if (value === undefined) {
            return hammer.format.NO_VALUE;
        }
        const {[column]: max} = maxByLevel[level] || {};
        if (!max || index === 'aggregation') {
            return asNumber(item, column);
        }

        const progress = (value / max) * 100;
        const text = hammer.format[useBytes ? 'Bytes' : 'Number'](value);

        if (level === 1) {
            return (
                <Progress
                    stack={[
                        {
                            value: progress,
                            color: getProgressBarColorByIndex(3),
                        },
                    ]}
                    text={text}
                />
            );
        }

        return <Progress value={progress} text={text} theme={'info'} />;
    };

    renderBytesProgress = (item, column) => {
        return this.renderProgress(item, column, true);
    };

    renderNumberProgress = (item, column) => {
        return this.renderProgress(item, column, false);
    };

    renderOverview() {
        const {tabletsFilter, changeTabletsFilter, tabletsMode, changeTabletsMode} = this.props;

        return (
            <Sticky topOffset={-HEADER_HEIGHT}>
                {({isSticky}) => (
                    <div className={block('overview', {sticky: isSticky})}>
                        <Filter
                            size="m"
                            value={tabletsFilter}
                            onChange={changeTabletsFilter}
                            placeholder="Filter by Tablet Id/Cell Id/State/Host..."
                            className={block('tablets-filter')}
                        />

                        <RadioButton
                            size="m"
                            value={tabletsMode}
                            onChange={changeTabletsMode}
                            name="navigation-tablets-mode"
                            items={[
                                {
                                    value: 'default',
                                    text: 'Default',
                                },
                                {
                                    value: 'data',
                                    text: 'Data',
                                },
                                {
                                    value: 'by_host',
                                    text: 'Data by nodes',
                                },
                                {
                                    value: 'by_cell',
                                    text: 'Data by cells',
                                },
                                {
                                    value: 'structure',
                                    text: 'Structure',
                                },
                                {
                                    value: 'performance',
                                    text: 'Performance',
                                },
                            ]}
                        />
                    </div>
                )}
            </Sticky>
        );
    }

    renderContent() {
        const {
            tablets,
            histogramCollapsed,
            toggleHistogram,
            histogram,
            activeHistogram,
            changeActiveHistogram,
            collapsibleSize,
        } = this.props;

        return (
            <Fragment>
                <CollapsibleSection
                    name="Histogram"
                    collapsed={histogramCollapsed}
                    onToggle={toggleHistogram}
                    size={collapsibleSize}
                >
                    <Histogram
                        activeHistogram={activeHistogram}
                        handleHistogramChange={changeActiveHistogram}
                        histogramItems={histogramItems}
                        histogram={histogram}
                    />
                </CollapsibleSection>

                <CollapsibleSection name="Tablets" size={collapsibleSize}>
                    <StickyContainer>
                        {this.renderOverview()}

                        <ElementsTable
                            {...this.tableSettings}
                            items={tablets}
                            rowClassName={Tablets.rowClassName}
                            onItemClick={this.onRowClick}
                        />
                    </StickyContainer>
                </CollapsibleSection>
            </Fragment>
        );
    }

    onRowClick = (item) => {
        const {isTopLevel, name} = item;
        if (isTopLevel) {
            this.props.toggleExpandedHost(name);
        }
    };

    render() {
        const {loading, loaded} = this.props;
        const initialLoading = loading && !loaded;

        return (
            <LoadDataHandler {...this.props}>
                <ErrorBoundary>
                    <div className={block({loading: initialLoading})}>
                        {initialLoading ? <Loader /> : this.renderContent()}
                    </div>
                </ErrorBoundary>
            </LoadDataHandler>
        );
    }
}

const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData, tabletsMode, tabletsFilter, histogramCollapsed} =
        state.navigation.tabs.tablets;
    const path = getPath(state);
    let tablets;
    let maxByLevel = [];
    if (tabletsMode === 'by_host' || tabletsMode === 'by_cell') {
        const data = getTabletsByName(state);
        tablets = data.items;
        maxByLevel = data.maxByLevel;
    } else {
        tablets = getTablets(state);
        maxByLevel = [getTabletsMax(state)];
    }

    const histogram = getHistogram(state);
    const activeHistogram = getActiveHistogram(state);
    const type = getType(state);

    return {
        loading,
        loaded,
        error,
        errorData,
        path,
        tablets,
        maxByLevel,
        tabletsMode,
        tabletsFilter,
        histogramCollapsed,
        activeHistogram,
        histogram,
        type,
        collapsibleSize: getUISizes().collapsibleSize,
    };
};

const mapDispatchToProps = {
    loadTablets,
    abortAndReset,
    toggleHistogram,
    changeTabletsMode,
    changeTabletsFilter,
    changeActiveHistogram,
    toggleExpandedHost,
};

const TabletsConnected = connect(mapStateToProps, mapDispatchToProps)(Tablets);

export default function TabletsWithRum() {
    const loadState = useSelector(getNavigationTabletsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_TAB_TABLETS,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_TAB_TABLETS,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <TabletsConnected />;
}
