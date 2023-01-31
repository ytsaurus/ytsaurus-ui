import hammer from '../../../common/hammer';
import {createSelector} from 'reselect';
import {storesTableItems} from '../../../utils/tablet/table';
import {TABLET_PARTITION_STORES_TABLE_ID} from '../../../constants/tablet';

const getRawStores = (state) => state.tablet.stores.stores;
const getSortState = (state) => state.tables[TABLET_PARTITION_STORES_TABLE_ID];

export const getStores = createSelector([getRawStores, getSortState], (stores, sortState) =>
    hammer.utils.sort(stores, sortState, storesTableItems),
);
