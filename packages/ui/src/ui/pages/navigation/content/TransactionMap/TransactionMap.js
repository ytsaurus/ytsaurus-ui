import React from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../store/redux-hooks';
import {
    changeFilter,
    loadTransactions,
} from '../../../../store/actions/navigation/content/transaction-map';
import {
    selectNavigationTransactionMapLoadingStatus,
    selectTransactions,
} from '../../../../store/selectors/navigation/content/transaction-map';
import {selectPath, selectTransaction} from '../../../../store/selectors/navigation';

import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../utils/utils';

import './TransactionMap.scss';

import {TransactionMapBase} from './TransactionMapBase';

const mapStateToProps = (state) => {
    const {filter, loading, loaded, error, errorData} = state.navigation.content.transactionMap;
    const path = selectPath(state);
    const transaction = selectTransaction(state);
    const transactions = selectTransactions(state);

    return {
        loading,
        loaded,
        error,
        errorData,
        path,
        transaction,
        filter,
        transactions,
    };
};

const mapDispatchToProps = {
    loadTransactions,
    changeFilter,
};

const TransactionMapConnected = connect(mapStateToProps, mapDispatchToProps)(TransactionMapBase);

export default function TranscationMapWithRum() {
    const transactionMapLoadState = useSelector(selectNavigationTransactionMapLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_CONTENT_TRANSACTION_MAP,
        startDeps: [transactionMapLoadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_CONTENT_TRANSACTION_MAP,
        stopDeps: [transactionMapLoadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <TransactionMapConnected />;
}
