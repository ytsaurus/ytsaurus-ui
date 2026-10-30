import {connect} from 'react-redux';
import {
    selectFavouriteAccountsSet,
    selectFilteredAccounts,
    selectUsableAccountsSet,
} from '../../../../../store/selectors/accounts/dashboard';

import {selectAccountsVisibilityMode} from '../../../../../store/selectors/settings';

import {loadUsers} from '../../../../../store/actions/accounts/editor';
import {accountsToggleFavourite} from '../../../../../store/actions/favourites';
import {selectMediumList} from '../../../../../store/selectors/thor';
import {
    changeContentFilter,
    changeMediumFilter,
    changeNameFilter,
    filterUsableAccounts,
    setAccountsAbcServiceFilter,
    setAccountsVisibilityMode,
    setActiveAccount,
} from '../../../../../store/actions/accounts/accounts';
import {
    selectAccountsAbcServiceIdSlugFilter,
    selectActiveAccountAggregationRow,
} from '../../../../../store/selectors/accounts/accounts';

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
    return (/** @type {import('../../../../../store/reducers').RootState} */ state) => {
        const nameToAccountMap = selectAccountsMapByName(state);
        const favouriteAccountsSet = selectFavouriteAccountsSet(state);

        const {
            accounts: {accounts},
        } = state;

        return {
            ...accounts,
            activeContentModeFilter: selectAccountsContentMode(state),

            clusterUiConfig: selectClusterUiConfig(state),

            mediumList: selectMediumList(state),
            accounts: accounts.accounts,
            contextViewTree: selectFilteredAccounts(state),
            nameToAccountMap,

            cluster: selectCluster(state),

            activeAccountAggregation: selectActiveAccountAggregationRow(state),
            favouriteAccountsSet,
            usableAccountsSet: selectUsableAccountsSet(state),
            accountsVisibilityMode: selectAccountsVisibilityMode(state),
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
    loadUsers,
    setActiveAccount,
    accountsToggleFavourite,
    setAccountsVisibilityMode,
    setAccountsAbcServiceFilter,
};

export const AccountsGeneralTab = connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(AccountsGeneralTabBase);
