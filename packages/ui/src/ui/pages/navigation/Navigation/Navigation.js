import React from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../store/redux-hooks';

import {selectCluster} from '../../../store/selectors/global';
import {updateTitle} from '../../../store/actions/global';
import {LOADING_STATUS} from '../../../constants/index';

import {onTransactionChange, setMode, updateView} from '../../../store/actions/navigation';

import {
    selectError,
    selectIdmSupport,
    selectIsNavigationFinalLoadState,
    selectLoadState,
    selectParsedPath,
    selectPath,
    selectTransaction,
    selectType,
} from '../../../store/selectors/navigation';
import {selectEffectiveMode, selectTabs} from '../../../store/selectors/navigation/navigation';
import {useRumMeasureStop} from '../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {showNavigationAttributesEditor} from '../../../store/actions/navigation/modals/attributes-editor';
import {UI_TAB_SIZE} from '../../../constants/global';

import './Navigation.scss';

import {NavigationBase} from './NavigationBase';

function mapStateToProps(state) {
    const isFinalState = selectIsNavigationFinalLoadState(state);
    const loadState = selectLoadState(state);
    const hasError = loadState === LOADING_STATUS.ERROR;
    const loaded = loadState === LOADING_STATUS.LOADED;
    return {
        path: selectPath(state),
        mode: selectEffectiveMode(state),
        type: selectType(state),
        isIdmSupported: selectIdmSupport(state),
        error: selectError(state),
        hasError,
        loaded,
        loading: !isFinalState,
        parsedPath: selectParsedPath(state),
        transaction: selectTransaction(state),
        cluster: selectCluster(state),
        tabSize: UI_TAB_SIZE,
        tabs: selectTabs(state),
    };
}

const mapDispatchToProps = {
    setMode,
    updateView,
    updateTitle,
    onTransactionChange,
    showNavigationAttributesEditor,
};

const NavigationConnected = connect(mapStateToProps, mapDispatchToProps)(NavigationBase);

const NavigationWithRumMemo = React.memo(NavigationWithMesure);

function NavigationWithMesure() {
    const path = useSelector(selectPath);
    const transaction = useSelector(selectTransaction);
    const isFinalState = useSelector(selectIsNavigationFinalLoadState);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_PRELOAD,
        startDeps: [isFinalState, path, transaction],
        allowStart: ([isFinal]) => {
            return !isFinal;
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_PRELOAD,
        stopDeps: [isFinalState],
        allowStop: ([isFinal]) => {
            return isFinal;
        },
    });

    return <NavigationConnected />;
}

export default function NavigationWithRum() {
    return <NavigationWithRumMemo />;
}
