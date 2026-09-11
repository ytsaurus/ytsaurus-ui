import {connect} from 'react-redux';
import {
    selectFavouriteAccountsSet,
    selectFilteredAccounts,
    selectFilteredAccountsOfDashboard,
} from '../../../../../store/selectors/accounts/dashboard';

import {
    selectAccountsVisibilityMode,
    selectAccountsVisibilityModeOfDashboard,
} from '../../../../../store/selectors/settings';

import {loadUsers} from '../../../../../store/actions/accounts/editor';
import {accountsToggleFavourite} from '../../../../../store/actions/favourites';
import {selectMediumList} from '../../../../../store/selectors/thor';
import {
    changeContentFilter,
    changeMediumFilter,
    changeNameFilter,
    closeEditorModal,
    filterUsableAccounts,
    loadEditedAccount,
    setAccountsAbcServiceFilter,
    setAccountsTreeState,
    setAccountsVisibilityMode,
    setAccountsVisibilityModeOfDashboard,
    setActiveAccount,
    showEditorModal,
} from '../../../../../store/actions/accounts/accounts';
import {
    selectAccountsAbcServiceIdSlugFilter,
    selectActiveAccountAggregationRow,
} from '../../../../../store/selectors/accounts/accounts';
import {DASHBOARD_VIEW_CONTEXT} from '../../../../../constants/index';

import '../AccountsGeneralTab.scss';
import {
    selectAccountsColumnFields,
    selectAccountsContentMode,
    selectAccountsMapByName,
    selectAccountsMasterMemoryContentMode,
} from '../../../../../store/selectors/accounts/accounts-ts';
import {
    selectCluster,
    selectClusterUiConfig,
    selectClusterUiConfigEnablePerAccountTabletAccounting,
} from '../../../../../store/selectors/global';
import {UI_COLLAPSIBLE_SIZE} from '../../../../../constants/global';

import {AccountsGeneralTabBase} from './AccountsGeneralTabBase';

const makeMapStateToProps = () => {
    return (state, ownProps) => {
        const nameToAccountMap = selectAccountsMapByName(state);
        const favouriteAccountsSet = selectFavouriteAccountsSet(state);

        const {
            accounts: {accounts},
        } = state;

        const {viewContext} = ownProps;
        const isDashboard = viewContext === DASHBOARD_VIEW_CONTEXT;

        const contextViewTree = isDashboard
            ? selectFilteredAccountsOfDashboard(state)
            : selectFilteredAccounts(state);

        return {
            ...accounts,
            activeContentModeFilter: selectAccountsContentMode(state),

            clusterUiConfig: selectClusterUiConfig(state),

            mediumList: selectMediumList(state),
            accounts: accounts.accounts,
            contextViewTree,
            nameToAccountMap,

            cluster: selectCluster(state),

            activeAccountAggregation: selectActiveAccountAggregationRow(state),
            favouriteAccountsSet,
            dashboardVisibilityMode: isDashboard
                ? selectAccountsVisibilityModeOfDashboard(state)
                : selectAccountsVisibilityMode(state),
            abcServiceFilter: selectAccountsAbcServiceIdSlugFilter(state),
            columnFields: selectAccountsColumnFields(state),

            enable_per_account_tablet_accounting:
                selectClusterUiConfigEnablePerAccountTabletAccounting(state),

            collapsibleSize: UI_COLLAPSIBLE_SIZE,

            masterMemoryContentMode: selectAccountsMasterMemoryContentMode(state),
        };
    };
};

const mapDispatchToProps = {
    changeNameFilter,
    changeContentFilter,
    changeMediumFilter,
    filterUsableAccounts,
    closeEditorModal,
    loadUsers,
    setAccountsTreeState,
    loadEditedAccount,
    setActiveAccount,
    showEditorModal,
    accountsToggleFavourite,
    setAccountsVisibilityModeOfDashboard,
    setAccountsVisibilityMode,
    setAccountsAbcServiceFilter,
};

export const AccountsGeneralTab = connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(AccountsGeneralTabBase);
