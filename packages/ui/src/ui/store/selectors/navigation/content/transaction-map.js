import hammer from '../../../../common/hammer';
import {createSelector} from 'reselect';
import {tableItems} from '../../../../utils/navigation/content/transaction-map/table';
import {NAVIGATION_TRANSACTION_MAP_TABLE_ID} from '../../../../constants/navigation/content/transaction-map';
import {calculateLoadingStatus} from '../../../../utils/utils';

const getRawTransactions = (state) => state.navigation.content.transactionMap.transactions;
const getSortState = (state) => state.tables[NAVIGATION_TRANSACTION_MAP_TABLE_ID];
const getFilter = (state) => state.navigation.content.transactionMap.filter;

const getFilteredTransactions = createSelector(
    [getRawTransactions, getFilter],
    (rawTransactions, filter) =>
        hammer.filter.filter({
            data: rawTransactions,
            input: filter,
            factors: ['id', 'title'],
        }),
);

export const getTransactions = createSelector(
    [getFilteredTransactions, getSortState],
    (filteredTransactions, sortState) =>
        hammer.utils.sort(filteredTransactions, sortState, tableItems),
);

export const getNavigationTransactionMapLoadingStatus = createSelector(
    [
        (store) => store.navigation.content.transactionMap.loading,
        (store) => store.navigation.content.transactionMap.loaded,
        (store) => store.navigation.content.transactionMap.error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);
