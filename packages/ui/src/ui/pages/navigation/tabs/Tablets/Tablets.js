import React from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../store/redux-hooks';

import {selectPath, selectType} from '../../../../store/selectors/navigation';

import {
    selectActiveHistogram,
    selectHistogram,
    selectIsReplicationDataExist,
    selectIsSearchByPivot,
    selectNavigationTabletsLoadingStatus,
    selectTablets,
} from '../../../../store/selectors/navigation/tabs/tablets';

import {
    abortAndReset,
    changeActiveHistogram,
    changeTabletsFilter,
    changeTabletsMode,
    loadTablets,
    toggleExpandedHost,
    toggleHistogram,
} from '../../../../store/actions/navigation/tabs/tablets';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {
    selectTabletsByName,
    selectTabletsMax,
} from '../../../../store/selectors/navigation/tabs/tablets-ts';

import './Tablets.scss';
import {UI_COLLAPSIBLE_SIZE} from '../../../../constants/global';

import {TabletsBase} from './TabletsBase';

const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData, tabletsMode, tabletsFilter, histogramCollapsed} =
        state.navigation.tabs.tablets;
    const path = selectPath(state);
    let tablets;
    let maxByLevel = [];
    if (tabletsMode === 'by_host' || tabletsMode === 'by_cell') {
        const data = selectTabletsByName(state);
        tablets = data.items;
        maxByLevel = data.maxByLevel;
    } else {
        tablets = selectTablets(state);
        maxByLevel = [selectTabletsMax(state)];
    }

    const histogram = selectHistogram(state);
    const activeHistogram = selectActiveHistogram(state);
    const type = selectType(state);
    const hasReplication = selectIsReplicationDataExist(state);
    const isSearchByPivot = selectIsSearchByPivot(state);

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
        hasReplication,
        collapsibleSize: UI_COLLAPSIBLE_SIZE,
        isSearchByPivot,
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

const TabletsConnected = connect(mapStateToProps, mapDispatchToProps)(TabletsBase);

export default function TabletsWithRum() {
    const tabletsLoadState = useSelector(selectNavigationTabletsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_TAB_TABLETS,
        startDeps: [tabletsLoadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_TAB_TABLETS,
        stopDeps: [tabletsLoadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <TabletsConnected />;
}
