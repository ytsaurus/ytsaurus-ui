import React from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../store/redux-hooks';
import {compose} from 'redux';

import {useDisableMaxContentWidth} from '../../../../containers/MaxContentWidth';
import {selectPath} from '../../../../store/selectors/navigation';
import {
    abortAndReset,
    closeColumnSelectorModal,
    getTableData,
    handleScreenChanged,
    updateColumns,
} from '../../../../store/actions/navigation/content/table/table';
import {
    selectAllColumns,
    selectOffsetValue,
    selectSrcColumns,
    selectVisibleColumns,
    selectVisibleRows,
} from '../../../../store/selectors/navigation/content/table';
import {
    selectColumns,
    selectIsDynamic,
    selectKeyColumns,
    selectNavigationTableLoadingState,
    selectYqlTypes,
} from '../../../../store/selectors/navigation/content/table-ts';
import {selectCluster} from '../../../../store/selectors/global';
import {selectTableYsonSettings} from '../../../../store/selectors/thor/unipika';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {isFinalLoadingStatus} from '../../../../utils/utils';

import './Table.scss';
import {makeTableRumId} from '../../../../store/actions/navigation/content/table/table-rum-id';

import {TableBase} from './TableBase';

const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData, isColumnSelectorOpen, isFullScreen} =
        state.navigation.content.table;
    const settings = selectTableYsonSettings(state);
    const {isSplit} = state.global.splitScreen;

    const path = selectPath(state);
    const columns = selectColumns(state);
    const yqlTypes = selectYqlTypes(state);
    const isDynamic = selectIsDynamic(state);
    const keyColumns = selectKeyColumns(state);
    const allColumns = selectAllColumns(state);
    const srcColumns = selectSrcColumns(state);
    const visibleRows = selectVisibleRows(state);
    const offsetValue = selectOffsetValue(state);
    const visibleColumns = selectVisibleColumns(state);

    return {
        loading,
        loaded,
        error,
        errorData,
        columns,
        keyColumns,
        allColumns,
        srcColumns,
        visibleColumns,
        isSplit,
        path,
        isDynamic,
        visibleRows,
        yqlTypes,
        settings,
        offsetValue,
        isColumnSelectorOpen,
        isFullScreen,
    };
};

const mapDispatchToProps = {
    updateColumns,
    getTableData,
    abortAndReset,
    handleScreenChanged,
    closeColumnSelectorModal,
};

const TableConnected = compose(connect(mapStateToProps, mapDispatchToProps))(TableBase);

export default function TableWithRum() {
    const tableLoadState = useSelector(selectNavigationTableLoadingState);
    const isDynamic = useSelector(selectIsDynamic);
    const cluster = useSelector(selectCluster);

    const measureId = makeTableRumId({cluster, isDynamic}).getMeasureId();

    useAppRumMeasureStart({
        type: measureId,
        startDeps: [tableLoadState, measureId],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: measureId,
        stopDeps: [tableLoadState, measureId],
        sybType: isDynamic ? 'dynamic' : 'static',
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    useDisableMaxContentWidth();
    return <TableConnected />;
}
