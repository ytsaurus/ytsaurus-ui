import hammer from '../../../common/hammer';
import {createSelector} from 'reselect';
import {storesTableItems} from '../../../utils/tablet/table';
import {TABLET_PARTITION_STORES_TABLE_ID} from '../../../constants/tablet';

const selectRawStores = (state) => state.tablet.stores.stores;
const selectSortState = (state) => state.tables[TABLET_PARTITION_STORES_TABLE_ID];

export const selectStores = createSelector(
    [selectRawStores, selectSortState],
    (stores, sortState) => hammer.utils.sort(stores, sortState, storesTableItems),
);
