import React from 'react';
import cn from 'bem-cn-lite';
import some_ from 'lodash/some';
import {Breadcrumbs} from '@gravity-ui/uikit';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import Favourites, {type FavouritesItem} from '../../../components/Favourites/Favourites';
import {
    selectFavouriteAccounts,
    selectIsActiveAccountInFavourites,
} from '../../../store/selectors/favourites';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectActiveAccount} from '../../../store/selectors/accounts/accounts-ts';
import {setActiveAccount} from '../../../store/actions/accounts/accounts';
import {accountsToggleFavourite} from '../../../store/actions/favourites';

import AccountCreate from '../tabs/general/Editor/AccountCreate';
import {useHistory} from 'react-router';
import {makeRoutedURL} from '../../../store/location';
import {Page} from '../../../constants';

import {selectCluster, selectClusterUiConfig} from '../../../store/selectors/global';
import {ACCOUNTS_ALLOWED_ROOT_TABS, AccountsTab} from '../../../constants/accounts/accounts';

import './AccountsTopRowContent.scss';
import UIFactory from '../../../UIFactory';
import {useAccountAttributes} from '../useAccountAttributes';

const block = cn('accounts-top-row-content');

function AccountsTopRowContent() {
    const clusterUiConfig = useSelector(selectClusterUiConfig);
    const account = useSelector(selectActiveAccount);
    const {data: accountAttributes} = useAccountAttributes(account);

    return (
        <RowWithName page={Page.ACCOUNTS} urlParams={{account: ''}}>
            <AccountsFavourites />
            <AccountsBreadcrumbs account={account} accountPath={accountAttributes?.path} />
            <span className={block('actions')}>
                {UIFactory.renderTopRowExtraControlsForAccount({
                    clusterUiConfig,
                    accountAttributes,
                })}
                <AccountCreate className={block('create')} />
            </span>
        </RowWithName>
    );
}

function AccountsFavourites() {
    const isActiveInFavourites = useSelector(selectIsActiveAccountInFavourites);
    const favourites = useSelector(selectFavouriteAccounts);
    const dispatch = useDispatch();
    const activeAccount = useSelector(selectActiveAccount);

    const handleFavouriteItemClick = React.useCallback(
        (item: FavouritesItem) => {
            dispatch(setActiveAccount(item.path));
        },
        [dispatch],
    );

    const handleFavouriteToggle = React.useCallback(() => {
        dispatch(accountsToggleFavourite(activeAccount));
    }, [dispatch, activeAccount]);

    return (
        <Favourites
            isActive={isActiveInFavourites}
            items={favourites}
            onItemClick={handleFavouriteItemClick}
            onToggle={handleFavouriteToggle}
            toggleDisabled={!activeAccount}
            theme={'clear'}
        />
    );
}

const ROOT_PLACEHOLDER = '<Root>';

interface AccountsBreadcrumbsProps {
    account: string;
    accountPath?: string;
}

const ACCOUNT_TREE_PREFIX = '//sys/account_tree/';

function AccountsBreadcrumbs({account, accountPath}: AccountsBreadcrumbsProps) {
    const dispatch = useDispatch();
    const cluster = useSelector(selectCluster);
    const history = useHistory();

    const handleBreadcrumbsClick = (key: string | number) => {
        dispatch(setActiveAccount(key === ROOT_PLACEHOLDER ? '' : key));
        const selectedAccount = key === ROOT_PLACEHOLDER ? '' : key;
        const pathname = selectedAccount
            ? window.location.pathname
            : calcRootPathname(window.location.pathname, cluster);
        history.push(makeRoutedURL(pathname, {account: selectedAccount}));
    };

    let accountNames: Array<string> = [];
    if (accountPath?.startsWith(ACCOUNT_TREE_PREFIX)) {
        accountNames = accountPath.slice(ACCOUNT_TREE_PREFIX.length).split('/');
    } else if (account) {
        accountNames = [account];
    }

    const items = ['', ...accountNames].map((accountName) => {
        const text = accountName || ROOT_PLACEHOLDER;

        return (
            <Breadcrumbs.Item
                key={text}
                href={calcRootPathname(window.location.pathname, cluster)}
                onClick={(e) => e.preventDefault()}
            >
                {text}
            </Breadcrumbs.Item>
        );
    });

    return (
        <Breadcrumbs className={block('breadcrumbs')} onAction={handleBreadcrumbsClick} showRoot>
            {items}
        </Breadcrumbs>
    );
}

function calcRootPathname(pathname: string, cluster: string) {
    const isAllowedRootTab = some_(ACCOUNTS_ALLOWED_ROOT_TABS, (_v, tab) => {
        return pathname.endsWith('/' + tab);
    });

    return isAllowedRootTab ? pathname : `/${cluster}/${Page.ACCOUNTS}/${AccountsTab.GENERAL}`;
}

export default React.memo(AccountsTopRowContent);
