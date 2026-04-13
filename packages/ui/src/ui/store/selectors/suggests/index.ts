import {RootState} from '../../reducers';

export const selectTabletCellBundlesSuggests = (state: RootState) =>
    state.suggests.tabletCellBundles.items;
