import {connect} from 'react-redux';

import {Page} from '../../constants/index';
import TabletCellBundlesTopRowContent from '../../pages/tablet_cell_bundles/TabletCellBundlesTopRowContent';
import {setChaosActiveBundle} from '../../store/actions/chaos_cell_bundles';
import type {RootState} from '../../store/reducers';
import {
    getChaosActiveBundle,
    getChaosActiveBundleData,
    getChaosBreadcrumbItems,
} from '../../store/selectors/chaos_cell_bundles';
import {
    getFavouriteChaosBundles,
    isActiveChaosBundleInFavourites,
} from '../../store/selectors/favourites';

const mapStateToProps = (state: RootState) => {
    return {
        activeBundle: getChaosActiveBundle(state),
        activeBundleData: getChaosActiveBundleData(state),
        bcItems: getChaosBreadcrumbItems(state),
        page: Page.CHAOS_CELL_BUNDLES,
        favourites: getFavouriteChaosBundles(state),
        isActiveBundleInFavourites: isActiveChaosBundleInFavourites(state),
    };
};

const mapDispatchToProps = {
    setActiveBundle: setChaosActiveBundle,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(TabletCellBundlesTopRowContent);
