import {RootState} from '../../reducers';

export const getTabletCellBundlesSuggests = (state: RootState) =>
    state.suggests.tabletCellBundles.items;
