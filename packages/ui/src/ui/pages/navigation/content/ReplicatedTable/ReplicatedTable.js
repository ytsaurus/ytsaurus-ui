import React, {Component} from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../store/redux-hooks';
import PropTypes from 'prop-types';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import hammer from '../../../../common/hammer';
import sortBy_ from 'lodash/sortBy';
import cn from 'bem-cn-lite';

import ColumnHeader from '../../../../components/ColumnHeader/ColumnHeader';

import {useDisableMaxContentWidth} from '../../../../containers/MaxContentWidth';
import ClickableAttributesButton from '../../../../components/AttributesButton/ClickableAttributesButton';
import TableActions from '../../../../pages/navigation/content/Table/TableOverview/TableActions';
import TableMeta from '../../../../pages/navigation/content/Table/TableMeta/TableMeta';
import {CurrentPathActions} from '../../../../pages/navigation/components/CurrentPathActions/CurrentPathActions';
import LoadDataHandler from '../../../../containers/LoadDataHandler/LoadDataHandler';
import {ClipboardButton, Tooltip} from '@ytsaurus/components';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import StatusBulb from '../../../../components/StatusBulb/StatusBulb';
import Icon from '../../../../components/Icon/Icon';
import Link from '../../../../containers/Link/Link';
import {StickyContainer} from '../../../../components/StickyContainer/StickyContainer';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';

import {
    abortAndReset,
    loadReplicas,
    performReplicaAction,
    toggleReplicatedTableSortOrder,
    updateEnableReplicatedTableTracker,
} from '../../../../store/actions/navigation/content/replicated-table';
import {selectAttributes, selectPath} from '../../../../store/selectors/navigation';
import {Page} from '../../../../constants/index';
import {ReplicatedTableSettingsButton} from './ReplicatedTableSettings';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {NAVIGATION_REPLICATED_TABLE_ID} from '../../../../constants/navigation/content/replicated-table';

import {
    selectAllowEnableReplicatedTracker,
    selectNavigationReplicatedTableLoadingStatus,
    selectReplicatedTableData,
    selectReplicatedTableSortSettings,
} from '../../../../store/selectors/navigation/content/replicated-table';

import './ReplicatedTable.scss';
import {CypressNodeTypes} from '../../../../utils/cypress-attributes';
import i18n from './i18n';

const block = cn('navigation-replicated-table');

const tableSets = {
    default: {
        items: [
            'name',
            'cluster',
            'content_type',
            'mode',
            'error_count',
            'replication_lag_time',
            'state',
            'actions',
        ],
    },
    'with-auto-switch': {
        items: [
            'name',
            'cluster',
            'content_type',
            'mode',
            'error_count',
            'replication_lag_time',
            'automatic_mode_switch',
            'state',
            'actions',
        ],
    },
};

class ReplicatedTable extends Component {
    static propTypes = {
        // from connect
        loading: PropTypes.bool.isRequired,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.bool.isRequired,
        errorData: PropTypes.object,

        path: PropTypes.string.isRequired,
        replicas: PropTypes.array.isRequired,
        attributes: PropTypes.object.isRequired,

        loadReplicas: PropTypes.func.isRequired,
        abortAndReset: PropTypes.func.isRequired,
        performReplicaAction: PropTypes.func.isRequired,
        type: PropTypes.string.isRequired,
        sortState: PropTypes.object,
        toggleReplicatedTableSortOrder: PropTypes.func.isRequired,
    };

    static tableItems = {
        name: {
            align: 'left',
            get(replica) {
                return ypath.getValue(replica, '');
            },
            get caption() {
                return i18n('field_id-path');
            },
        },
        cluster: {
            align: 'left',
            sort: true,
            allowUnordered: true,
            get(replica) {
                return ypath.getValue(replica, '/@cluster_name');
            },
            get caption() {
                return i18n('field_cluster');
            },
        },
        content_type: {
            align: 'left',
            sort: true,
            allowUnordered: true,
            get(replica) {
                return ypath.getValue(replica, '/@content_type');
            },
            get caption() {
                return i18n('field_content-type');
            },
        },
        mode: {
            align: 'left',
            sort: true,
            allowUnordered: true,
            get(replica) {
                return ypath.getValue(replica, '/@mode');
            },
            get caption() {
                return i18n('field_mode');
            },
        },
        error_count: {
            align: 'center',
            sort: true,
            allowUnordered: true,
            get(replica) {
                return ypath.getValue(replica, '/@error_count');
            },
            get caption() {
                return i18n('field_error-count');
            },
        },
        errors: {
            align: 'left',
            sort: true,
            allowUnordered: true,
            get(replica) {
                return ypath.getValue(replica, '/@errors');
            },
            get caption() {
                return i18n('field_errors');
            },
        },
        replication_lag_time: {
            align: 'right',
            sort: true,
            allowUnordered: true,
            get(replica) {
                return ypath.getValue(replica, '/@replication_lag_time');
            },
            get caption() {
                return i18n('field_replication-lag-time');
            },
        },
        state: {
            align: 'center',
            sort: true,
            allowUnordered: true,
            get(replica) {
                return ypath.getValue(replica, '/@state');
            },
            get caption() {
                return i18n('field_state');
            },
        },
        automatic_mode_switch: {
            align: 'center',
            sort: true,
            allowUnordered: true,
            get(replica) {
                const flag = ypath.getValue(replica, '/@replicated_table_tracker_enabled');
                return flag === 'true' || flag === true;
            },
            get caption() {
                return i18n('field_replicated-table-tracker');
            },
        },
        actions: {
            align: 'center',
            caption: '',
            sort: false,
        },
    };

    static renderField(item, columnName) {
        const value = ReplicatedTable.tableItems[columnName].get(item);

        return !value ? hammer.format.NO_VALUE : value;
    }

    static renderAsReadableField(item, columnName) {
        const value = ReplicatedTable.tableItems[columnName].get(item);

        return hammer.format['ReadableField'](value);
    }

    static renderAsTimeDuration(item, columnName) {
        const value = ReplicatedTable.tableItems[columnName].get(item);

        return hammer.format['TimeDuration'](Number(value));
    }

    static renderName(replica) {
        const value = ypath.getValue(replica, '');
        const attributes = ypath.getValue(replica, '/@');
        const [path, cluster] = ypath.getValues(attributes, ['/replica_path', '/cluster_name']);
        const copy = {
            get pathTitle() {
                return i18n('action_copy-replica-path');
            },
            get idTitle() {
                return i18n('action_copy-replica-id');
            },
        };

        const replicaLink = <Link url={`/${cluster}/${Page.NAVIGATION}?path=${path}`}>{path}</Link>;

        return (
            <div>
                <span className="elements-ellipsis elements-monospace">
                    <ClipboardButton
                        text={value}
                        view="flat-secondary"
                        size="s"
                        title={copy.idTitle}
                    />
                    {value}
                </span>
                <br />
                <span className="elements-ellipsis elements-secondary-text">
                    <ClipboardButton
                        text={path}
                        view="flat-secondary"
                        size="s"
                        title={copy.pathTitle}
                    />{' '}
                    {i18n('field_path')} {replicaLink}
                </span>
            </div>
        );
    }

    static renderErrors() {
        return hammer.format.NO_VALUE; // No more supported by server
    }

    static renderState(item, columnName) {
        const state = ReplicatedTable.tableItems[columnName].get(item);

        return <StatusBulb theme={state} />;
    }

    static renderAutomaticModeSwitch(enableTableTracker, item, columnName) {
        const value = ReplicatedTable.tableItems[columnName].get(item);
        const theme = !enableTableTracker ? 'unknown' : value ? 'enabled' : 'disabled';
        const title = value ? i18n('value_enabled') : i18n('value_disabled');
        return (
            <Tooltip
                content={enableTableTracker ? title : i18n('context_disabled-by-table-settings')}
            >
                <StatusBulb theme={theme} className={block('auto-switch', {})} />
                {!enableTableTracker && (
                    <Icon
                        color="secondary"
                        awesome="question-circle"
                        className={block('info-icon')}
                    />
                )}
            </Tooltip>
        );
    }
    componentDidMount() {
        this.props.loadReplicas();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.path !== this.props.path) {
            this.props.loadReplicas();
        }
    }

    componentWillUnmount() {
        this.props.abortAndReset();
    }

    getSortedReplicas() {
        const {replicas, sortState} = this.props;

        if (!sortState || !sortState.field) {
            return replicas;
        }
        const {field, asc} = sortState;
        const getValueByField =
            field === 'cluster_name' || field === 'replica_path'
                ? (replica) => ypath.getValue(replica, `/@${field}`)
                : ReplicatedTable.tableItems[field]?.get;

        if (!getValueByField) {
            return replicas;
        }
        const sortedReplicas = sortBy_(replicas, getValueByField);

        return asc ? sortedReplicas : sortedReplicas.reverse();
    }

    renderNameHeader = () => {
        const {sortState} = this.props;

        const isSortedByCluster = sortState?.field === 'cluster_name';
        const isSortedByPath = sortState?.field === 'replica_path';
        const isSorted = isSortedByCluster || isSortedByPath;
        const order = sortState?.asc ? 'asc' : 'desc';

        return (
            <ColumnHeader
                column={isSortedByPath ? 'replica_path' : 'cluster_name'}
                order={isSorted ? order : undefined}
                title={i18n('field_id-path')}
                options={[
                    {
                        column: 'cluster_name',
                        title: i18n('field_replica-id'),
                        allowUnordered: true,
                    },
                    {
                        column: 'replica_path',
                        title: i18n('field_replica-path'),
                        allowUnordered: true,
                    },
                ]}
                onSort={(columnName) => {
                    this.props.toggleReplicatedTableSortOrder(columnName, true, false);
                }}
            />
        );
    };

    get tableSettings() {
        const {loading, loaded, tableMode, enable_replicated_table_tracker} = this.props;

        const items = {
            ...ReplicatedTable.tableItems,
            name: {
                ...ReplicatedTable.tableItems.name,
                renderHeader: this.renderNameHeader,
            },
        };
        return {
            css: block(),
            theme: 'light',
            size: 's',
            striped: false,
            itemHeight: 65,
            isLoading: loading && !loaded,
            tableId: NAVIGATION_REPLICATED_TABLE_ID,
            getEffectiveSortState: () => this.props.sortState || null,
            columns: {
                items,
                sets: tableSets,
                mode: tableMode,
            },
            templates: {
                name: ReplicatedTable.renderName,
                cluster: ReplicatedTable.renderField,
                content_type: ReplicatedTable.renderField,
                mode: ReplicatedTable.renderField,
                errors: ReplicatedTable.renderErrors,
                error_count: ReplicatedTable.renderAsReadableField,
                state: ReplicatedTable.renderState,
                automatic_mode_switch: ReplicatedTable.renderAutomaticModeSwitch.bind(
                    null,
                    enable_replicated_table_tracker,
                ),
                replication_lag_time: ReplicatedTable.renderAsTimeDuration,
                actions: this.renderActions,
            },
            computeKey(item) {
                return item.$value;
            },
            onSort: (columnName) => {
                const column = ReplicatedTable.tableItems[columnName];

                this.props.toggleReplicatedTableSortOrder(
                    columnName,
                    column?.allowUnordered,
                    column?.sortWithUndefined,
                );
            },
        };
    }

    renderActions = (replica) => {
        const {attributes, performReplicaAction} = this.props;
        const replicaValue = ypath.getValue(replica, '');
        const replicaAttributes = ypath.getValue(replica, '/@');

        const isAsync = replicaAttributes.mode === 'async';
        const atomicity = attributes?.atomicity;
        const replicaData = {
            caption: replicaValue,
            attributes:
                isAsync && atomicity ? {...replicaAttributes, atomicity} : replicaAttributes,
        };

        const onApply = (modeState) => {
            return performReplicaAction({...modeState, replica});
        };

        const replicatedTableTracker = ypath.getValue(
            replica,
            '/@replicated_table_tracker_enabled',
        );

        return (
            <span>
                <ClickableAttributesButton
                    title={replicaData.caption}
                    attributes={replicaData.attributes}
                    withTooltip
                />
                <ReplicatedTableSettingsButton
                    replica_cluster={ypath.getValue(replica, '/@cluster_name')}
                    replica_path={ypath.getValue(replica, '/@replica_path')}
                    state={ypath.getValue(replica, '/@state')}
                    mode={ypath.getValue(replica, '/@mode')}
                    auto_replica_tracker={
                        replicatedTableTracker === 'true' || replicatedTableTracker === true
                            ? 'enabled'
                            : 'disabled'
                    }
                    onApply={onApply}
                />
            </span>
        );
    };

    updateEnableReplicatedTableTracker = (value) => {
        const {updateEnableReplicatedTableTracker, path, type} = this.props;
        return updateEnableReplicatedTableTracker({path, value, type});
    };

    render() {
        const {type} = this.props;
        const hasActions = type !== CypressNodeTypes.CHAOS_REPLICATED_TABLE;

        return (
            <LoadDataHandler {...this.props}>
                <div className={block()}>
                    <TableMeta
                        onEditEnableReplicatedTableTracker={this.updateEnableReplicatedTableTracker}
                    />

                    <StickyContainer>
                        {({stickyTopClassName}) => (
                            <React.Fragment>
                                {hasActions && (
                                    <Toolbar
                                        className={stickyTopClassName}
                                        itemsToWrap={[
                                            {node: <TableActions block={block} />},
                                            {node: <CurrentPathActions />},
                                        ]}
                                    />
                                )}
                                <ElementsTable
                                    {...this.tableSettings}
                                    items={this.getSortedReplicas()}
                                />
                            </React.Fragment>
                        )}
                    </StickyContainer>
                </div>
            </LoadDataHandler>
        );
    }
}
const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData, replicas} = selectReplicatedTableData(state);
    const allowEnableReplicatedTracker = selectAllowEnableReplicatedTracker(state);
    const path = selectPath(state);
    const attributes = selectAttributes(state);
    const sortState = selectReplicatedTableSortSettings(state);

    const [enable_replicated_table_tracker, type] = ypath.getValues(attributes, [
        '/replicated_table_options/enable_replicated_table_tracker',
        '/type',
    ]);

    return {
        loading,
        loaded,
        error,
        errorData,
        path,
        replicas,
        attributes,
        tableMode: allowEnableReplicatedTracker ? 'with-auto-switch' : 'default',
        enable_replicated_table_tracker,
        type,
        sortState,
    };
};

const mapDispatchToProps = {
    loadReplicas,
    abortAndReset,
    performReplicaAction,
    updateEnableReplicatedTableTracker,
    toggleReplicatedTableSortOrder,
};

const ReplicatedTableConnected = connect(mapStateToProps, mapDispatchToProps)(ReplicatedTable);

export default function ReplicatedTableWithRum() {
    useDisableMaxContentWidth();

    const loadState = useSelector(selectNavigationReplicatedTableLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_REPLICATED_TABLE,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_CONTENT_REPLICATED_TABLE,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <ReplicatedTableConnected />;
}
