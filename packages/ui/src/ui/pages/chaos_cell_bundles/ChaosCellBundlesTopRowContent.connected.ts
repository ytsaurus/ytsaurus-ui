import {connect} from 'react-redux';

import {Page} from '../../constants/index';
import TabletCellBundlesTopRowContent from '../../pages/tablet_cell_bundles/TabletCellBundlesTopRowContent';
import {setChaosActiveBundle} from '../../store/actions/chaos_cell_bundles';
import type {RootState} from '../../store/reducers';
import {
    selectChaosActiveBundle,
    selectChaosActiveBundleData,
    selectChaosBreadcrumbItems,
} from '../../store/selectors/chaos_cell_bundles';
import {
    selectFavouriteChaosBundles,
    selectIsActiveChaosBundleInFavourites,
} from '../../store/selectors/favourites';

const mapStateToProps = (state: RootState) => {
    return {
        activeBundle: selectChaosActiveBundle(state),
        activeBundleData: selectChaosActiveBundleData(state),
        bcItems: selectChaosBreadcrumbItems(state),
        page: Page.CHAOS_CELL_BUNDLES,
        favourites: selectFavouriteChaosBundles(state),
        isActiveBundleInFavourites: selectIsActiveChaosBundleInFavourites(state),
    };
};

const mapDispatchToProps = {
    setActiveBundle: setChaosActiveBundle,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(TabletCellBundlesTopRowContent);
