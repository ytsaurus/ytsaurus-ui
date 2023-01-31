import {initialState as transactionMapInitialState} from '../../../../../store/reducers/navigation/content/transaction-map/transaction-map';
import {initialState as tableSortState} from '../../../../../store/reducers/tables';

import {NAVIGATION_TRANSACTION_MAP_TABLE_ID} from '../../../../../constants/navigation/content/transaction-map';
import {parseSortState} from '../../../../../utils';
import {RootState} from '../../../../../store/reducers';
import produce from 'immer';
import {updateIfChanged} from '../../../../../utils/utils';

export const transactionMapParams = {
    txFilter: {
        stateKey: 'navigation.content.transactionMap.filter',
        initialState: transactionMapInitialState.filter,
    },
    txSort: {
        stateKey: `tables.${NAVIGATION_TRANSACTION_MAP_TABLE_ID}`,
        initialState: {
            ...tableSortState[NAVIGATION_TRANSACTION_MAP_TABLE_ID],
        },
        options: {parse: parseSortState},
        type: 'object',
    },
};

export function getNavigationTransactionMapPreparedState(
    state: RootState,
    {query}: {query: RootState},
) {
    return produce(state, (draft) => {
        updateIfChanged(
            draft.navigation.content.transactionMap,
            'filter',
            query.navigation.content.transactionMap.filter,
        );
        updateIfChanged(
            draft.tables,
            NAVIGATION_TRANSACTION_MAP_TABLE_ID,
            query.tables[NAVIGATION_TRANSACTION_MAP_TABLE_ID],
        );
    });
}
