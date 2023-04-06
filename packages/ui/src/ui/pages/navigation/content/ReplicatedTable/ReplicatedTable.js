import {Sticky, StickyContainer} from 'react-sticky';
import React, {Component} from 'react';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import hammer from '../../../../common/hammer';
import cn from 'bem-cn-lite';

import ClickableAttributesButton from '../../../../components/AttributesButton/ClickableAttributesButton';
import TableActions from '../../../../pages/navigation/content/Table/TableOverview/TableActions';
import TableMeta from '../../../../pages/navigation/content/Table/TableMeta/TableMeta';
import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import StatusBulb from '../../../../components/StatusBulb/StatusBulb';
import Link from '../../../../components/Link/Link';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';

import {
    loadReplicas,
    abortAndReset,
    performReplicaAction,
    updateEnableReplicatedTableTracker,
} from '../../../../store/actions/navigation/content/replicated-table';
import {getPath, getAttributes} from '../../../../store/selectors/navigation';
import {HEADER_HEIGHT, Page} from '../../../../constants/index';

import {ReplicatedTableSettingsButton} from './ReplicatedTableSettings';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {isFinalLoadingStatus} from '../../../../utils/utils';

import {
    getNavigationReplicatedTableLoadingStatus,
    getAllowEnableReplicatedTracker,
    getReplicatedTableData,
} from '../../../../store/selectors/navigation/content/replicated-table';

import './ReplicatedTable.scss';
import {CypressNodeTypes} from '../../../../utils/cypress-attributes';

const block = cn('navigation-replicated-table');

const tableSets = {
    default: {
        items: [
            'name',
            'cluster',
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
    };

    static tableItems = {
        name: {
            align: 'left',
            caption: 'Id / Path',
            sort: false,
        },
        cluster: {
            align: 'left',
            sort: false,
            get(replica) {
                return ypath.getValue(replica, '/@cluster_name');
            },
        },
        mode: {
            align: 'left',
            sort: false,
            get(replica) {
                return ypath.getValue(replica, '/@mode');
            },
        },
        error_count: {
            align: 'center',
            caption: 'Error count',
            get(replica) {
                return ypath.getValue(replica, '/@error_count');
            },
        },
        errors: {
            align: 'left',
            get(replica) {
                return ypath.getValue(replica, '/@errors');
            },
        },
        replication_lag_time: {
            align: 'right',
            get(replica) {
                return ypath.getValue(replica, '/@replication_lag_time');
            },
        },
        state: {
            align: 'center',
            get(replica) {
                return ypath.getValue(replica, '/@state');
            },
        },
        automatic_mode_switch: {
            align: 'center',
            get(replica) {
                const flag = ypath.getValue(replica, '/@replicated_table_tracker_enabled');
                return flag === 'true' || flag === true;
            },
        },
        actions: {
            align: 'center',
            caption: '',
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
            pathTitle: 'Copy replica path',
            idTitle: 'Copy replica id',
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
                    Path {replicaLink}
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
        const title = value ? 'Enabled' : 'Disabled';
        return (
            <Tooltip content={enableTableTracker ? title : 'Disabled by table settings'}>
                <StatusBulb theme={theme} className={block('auto-switch', {})} />
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

    get tableSettings() {
        const {loading, loaded, tableMode, enable_replicated_table_tracker} = this.props;

        return {
            css: block(),
            theme: 'light',
            size: 's',
            striped: false,
            itemHeight: 65,
            isLoading: loading && !loaded,
            columns: {
                items: ReplicatedTable.tableItems,
                sets: tableSets,
                mode: tableMode,
            },
            templates: {
                name: ReplicatedTable.renderName,
                cluster: ReplicatedTable.renderField,
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
        const {updateEnableReplicatedTableTracker, path} = this.props;
        return updateEnableReplicatedTableTracker(path, value);
    };

    render() {
        const {replicas, type} = this.props;
        const hasActions = type !== CypressNodeTypes.CHAOS_REPLICATED_TABLE;

        return (
            <LoadDataHandler {...this.props}>
                <div className={block()}>
                    <TableMeta
                        onEditEnableReplicatedTableTracker={this.updateEnableReplicatedTableTracker}
                    />

                    <StickyContainer>
                        <Sticky topOffset={-HEADER_HEIGHT}>
                            {({isSticky}) => (
                                <div
                                    className={block('overview', {
                                        sticky: isSticky,
                                    })}
                                >
                                    {hasActions && <TableActions block={block} />}
                                </div>
                            )}
                        </Sticky>
                    </StickyContainer>

                    <ElementsTable {...this.tableSettings} items={replicas} />
                </div>
            </LoadDataHandler>
        );
    }
}

const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData, replicas} = getReplicatedTableData(state);
    const allowEnableReplicatedTracker = getAllowEnableReplicatedTracker(state);
    const path = getPath(state);
    const attributes = getAttributes(state);

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
    };
};

const mapDispatchToProps = {
    loadReplicas,
    abortAndReset,
    performReplicaAction,
    updateEnableReplicatedTableTracker,
};

const ReplicatedTableConnected = connect(mapStateToProps, mapDispatchToProps)(ReplicatedTable);

export default function ReplicatedTableWithRum() {
    const loadState = useSelector(getNavigationReplicatedTableLoadingStatus);

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
