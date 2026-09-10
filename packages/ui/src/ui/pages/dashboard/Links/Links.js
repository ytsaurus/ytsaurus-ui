import {connect} from 'react-redux';

import {changeActiveTab} from '../../../store/actions/dashboard/dashboad';
import {
    selectFavouriteAccounts,
    selectFavouritePaths,
    selectLastVisitedAccounts,
    selectLastVisitedPaths,
    selectPopularAccounts,
    selectPopularPaths,
} from '../../../store/selectors/favourites';

import './Links.scss';
import {selectCluster} from '../../../store/selectors/global';
import {UI_TAB_SIZE} from '../../../constants/global';

import {LinksBase} from './LinksBase';

const mapStateToProps = (state) => {
    const {activeTab} = state.dashboard;

    return {
        activeTab,
        lastVisited: selectLastVisitedPaths(state),
        popular: selectPopularPaths(state),
        favourites: selectFavouritePaths(state),
        lastVisitedAccounts: selectLastVisitedAccounts(state),
        popularAccounts: selectPopularAccounts(state),
        favouriteAccounts: selectFavouriteAccounts(state),
        tabSize: UI_TAB_SIZE,
        cluster: selectCluster(state),
    };
};

const Links = connect(mapStateToProps, {changeActiveTab})(LinksBase);

export default Links;
