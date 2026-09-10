import React from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../store/redux-hooks';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import {useDisableMaxContentWidth} from '../../../../containers/MaxContentWidth';

import {
    abortAndReset,
    loadReplicas,
    performReplicaAction,
    toggleReplicatedTableSortOrder,
    updateEnableReplicatedTableTracker,
} from '../../../../store/actions/navigation/content/replicated-table';
import {selectAttributes, selectPath} from '../../../../store/selectors/navigation';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {isFinalLoadingStatus} from '../../../../utils/utils';

import {
    selectAllowEnableReplicatedTracker,
    selectNavigationReplicatedTableLoadingStatus,
    selectReplicatedTableData,
    selectReplicatedTableSortSettings,
} from '../../../../store/selectors/navigation/content/replicated-table';

import './ReplicatedTable.scss';

import {ReplicatedTableBase} from './ReplicatedTableBase';
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

const ReplicatedTableConnected = connect(mapStateToProps, mapDispatchToProps)(ReplicatedTableBase);

export default function ReplicatedTableWithRum() {
    useDisableMaxContentWidth();

    const replicatedTableLoadState = useSelector(selectNavigationReplicatedTableLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_REPLICATED_TABLE,
        startDeps: [replicatedTableLoadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_CONTENT_REPLICATED_TABLE,
        stopDeps: [replicatedTableLoadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <ReplicatedTableConnected />;
}
