import hammer from '../../../../common/hammer';
import {createSelector} from 'reselect';
import {tableItems} from '../../../../utils/navigation/content/transaction-map/table';
import {NAVIGATION_TRANSACTION_MAP_TABLE_ID} from '../../../../constants/navigation/content/transaction-map';
import {calculateLoadingStatus} from '../../../../utils/utils';

const selectRawTransactions = (state) => state.navigation.content.transactionMap.transactions;
const selectSortState = (state) => state.tables[NAVIGATION_TRANSACTION_MAP_TABLE_ID];
const selectFilter = (state) => state.navigation.content.transactionMap.filter;

const selectFilteredTransactions = createSelector(
    [selectRawTransactions, selectFilter],
    (rawTransactions, filter) =>
        hammer.filter.filter({
            data: rawTransactions,
            input: filter,
            factors: ['id', 'title'],
        }),
);

export const selectTransactions = createSelector(
    [selectFilteredTransactions, selectSortState],
    (filteredTransactions, sortState) =>
        hammer.utils.sort(filteredTransactions, sortState, tableItems),
);

export const selectNavigationTransactionMapLoadingStatus = createSelector(
    [
        (store) => store.navigation.content.transactionMap.loading,
        (store) => store.navigation.content.transactionMap.loaded,
        (store) => store.navigation.content.transactionMap.error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);
