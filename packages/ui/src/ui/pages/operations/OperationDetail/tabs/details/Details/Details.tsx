import React from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../../../store/redux-hooks';

import {type RootState} from '../../../../../../store/reducers';
import {showEditPoolsWeightsModal} from '../../../../../../store/actions/operations';
import {selectCluster} from '../../../../../../store/selectors/global';
import {
    selectIsOperationInGpuTree,
    selectOperationAlertEvents,
    selectOperationDetailsLoadingStatus,
} from '../../../../../../store/selectors/operations/operation';

import {useRumMeasureStop} from '../../../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../../../utils/utils';
import {useAppRumMeasureStart} from '../../../../../../rum/rum-app-measures';

import {UI_COLLAPSIBLE_SIZE} from '../../../../../../constants/global';

import './Details.scss';

import {DetailsBase} from './DetailsBase';

const mapStateToProps = (state: RootState) => {
    const operation = state.operations.detail.operation;
    const isOperationInGpuTree = selectIsOperationInGpuTree(state);

    return {
        cluster: selectCluster(state),
        operation,
        treeConfigs: state.operations.detail.treeConfigs,
        ...state.operations.detail.details,
        collapsibleSize: UI_COLLAPSIBLE_SIZE,
        alertEvents: selectOperationAlertEvents(state),
        isVanillaGpuOperation: operation.type === 'vanilla' && isOperationInGpuTree,
        isOperationInGpuTree,
    };
};

const mapDispatchToProps = {
    showEditPoolsWeightsModal,
};

const DetailsConnected = connect(mapStateToProps, mapDispatchToProps)(DetailsBase);

export default function DetailsWithRum() {
    const operationLoadState = useSelector(selectOperationDetailsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.OPERATION_TAB_DETAILS,
        additionalStartType: RumMeasureTypes.OPERATION,
        startDeps: [operationLoadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.OPERATION_TAB_DETAILS,
        stopDeps: [operationLoadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <DetailsConnected />;
}
