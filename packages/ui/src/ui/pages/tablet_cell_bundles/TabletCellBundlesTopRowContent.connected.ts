import {connect} from 'react-redux';

import {Page} from '../../constants/index';
import TabletCellBundlesTopRowContent from '../../pages/tablet_cell_bundles/TabletCellBundlesTopRowContent';
import {setTabletsActiveBundle} from '../../store/actions/tablet_cell_bundles';
import type {RootState} from '../../store/reducers';
import {
    getTabletsActiveBundle,
    getTabletsActiveBundleData,
    getTabletsBreadcrumbItems,
} from '../../store/selectors/tablet_cell_bundles';
import {bundlesToggleFavourite} from '../../store/actions/favourites';
import {getFavouriteBundles, isActiveBundleInFavourites} from '../../store/selectors/favourites';

const mapStateToProps = (state: RootState) => {
    return {
        activeBundle: getTabletsActiveBundle(state),
        activeBundleData: getTabletsActiveBundleData(state),
        bcItems: getTabletsBreadcrumbItems(state),
        page: Page.TABLET_CELL_BUNDLES,
        favourites: getFavouriteBundles(state),
        isActiveBundleInFavourites: isActiveBundleInFavourites(state),
    };
};

const mapDispatchToProps = {
    setActiveBundle: setTabletsActiveBundle,
    toggleFavourite: bundlesToggleFavourite,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(TabletCellBundlesTopRowContent);
