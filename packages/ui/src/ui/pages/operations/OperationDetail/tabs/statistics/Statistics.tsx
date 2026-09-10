import React from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../../store/redux-hooks';
import {
    changeAggregation,
    changeFilterText,
    changeJobType,
    changePoolTreeFilter,
    setTreeState,
} from '../../../../../store/actions/operations/statistics';

import {type RootState} from '../../../../../store/reducers';
import {selectOperationDetailsLoadingStatus} from '../../../../../store/selectors/operations/operation';
import {
    selectOperationStatisticsActiveFilterValues,
    selectOperationStatisticsAvailableValues,
    selectOperationStatisticsFiltered,
} from '../../../../../store/selectors/operations/statistics-v2';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import {isFinalLoadingStatus} from '../../../../../utils/utils';
import {useAppRumMeasureStart} from '../../../../../rum/rum-app-measures';
import './Statistics.scss';

import {StatisticsBase} from './StatisticsBase';

const mapStateToProps = (state: RootState) => {
    const {treeState, activeAggregation} = state.operations.statistics;

    const {job_type: jobTypes, pool_tree: poolTrees} =
        selectOperationStatisticsAvailableValues(state);

    return {
        items: selectOperationStatisticsFiltered(state),
        treeState,
        activeAggregation,
        jobTypes,
        poolTrees,
        ...selectOperationStatisticsActiveFilterValues(state),
    };
};

const mapDispatchToProps = {
    setTreeState,
    changeFilterText,
    changeAggregation,
    changeJobType,
    changePoolTreeFilter,
};

const StatisticsConnected = connect(mapStateToProps, mapDispatchToProps)(StatisticsBase);

export default function SpecificationWithRum(props: {className: string}) {
    const operationLoadState = useSelector(selectOperationDetailsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.OPERATION_TAB_STATISTICS,
        additionalStartType: RumMeasureTypes.OPERATION,
        startDeps: [operationLoadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.OPERATION_TAB_STATISTICS,
        stopDeps: [operationLoadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <StatisticsConnected {...props} />;
}
