import React from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../store/redux-hooks';

import {getTabletErrors} from '../../../../store/actions/navigation/tabs/tablet-errors/tablet-errors-background';
import {selectPath} from '../../../../store/selectors/navigation';
import {selectEffectiveMode} from '../../../../store/selectors/navigation/navigation';
import {selectCluster} from '../../../../store/selectors/global';
import {
    selectTabletErrorsLoadingStatus,
    selectTabletErrorsReplicationErrors,
} from '../../../../store/selectors/navigation/tabs/tablet-errors-background';
import {type RootState} from '../../../../store/reducers';

import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {isFinalLoadingStatus} from '../../../../utils/utils';

import './TabletErrorsBackground.scss';

import {TabletErrorsBackgroundBase} from './TabletErrorsBackgroundBase';

const mapStateToProps = (state: RootState) => {
    const {loading, loaded, error, tabletErrors} = state.navigation.tabs.tabletErrorsBackground;
    const path = selectPath(state);
    const mode = selectEffectiveMode(state);
    const cluster = selectCluster(state);

    return {
        loading,
        loaded,
        error,

        path,
        mode,
        tabletErrors,
        cluster,
        replicationErrors: selectTabletErrorsReplicationErrors(state),
    };
};

const mapDispatchToProps = {
    getTabletErrors,
};

const TabletErrorsConnected = connect(
    mapStateToProps,
    mapDispatchToProps,
)(TabletErrorsBackgroundBase);

export default function TabletErrorsWithRum() {
    const loadState = useSelector(selectTabletErrorsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_TAB_TABLET_ERRORS,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_TAB_TABLET_ERRORS,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <TabletErrorsConnected />;
}
