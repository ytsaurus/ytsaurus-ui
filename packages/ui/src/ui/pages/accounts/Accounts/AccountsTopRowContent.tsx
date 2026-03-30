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
import {
    selectAccountsMapByName,
    selectActiveAccount,
} from '../../../store/selectors/accounts/accounts-ts';
import {setActiveAccount} from '../../../store/actions/accounts/accounts';
import {accountsToggleFavourite} from '../../../store/actions/favourites';
import {selectActiveAccountBreadcrumbs} from '../../../store/selectors/accounts/accounts';

import AccountCreate from '../tabs/general/Editor/AccountCreate';
import {useHistory} from 'react-router';
import {makeRoutedURL} from '../../../store/location';
import {Page} from '../../../constants';

import {selectCluster, selectClusterUiConfig} from '../../../store/selectors/global';
import {ACCOUNTS_ALLOWED_ROOT_TABS, AccountsTab} from '../../../constants/accounts/accounts';

import './AccountsTopRowContent.scss';
import UIFactory from '../../../UIFactory';

const block = cn('accounts-top-row-content');

function AccountsTopRowContent() {
    const clusterUiConfig = useSelector(selectClusterUiConfig);
    const account = useSelector(selectActiveAccount);
    const accountsByName = useSelector(selectAccountsMapByName);

    const current = accountsByName[account];

    return (
        <RowWithName page={Page.ACCOUNTS} urlParams={{account: ''}}>
            <AccountsFavourites />
            <AccountsBreadcrumbs />
            <span className={block('actions')}>
                {UIFactory.renderTopRowExtraControlsForAccount({
                    clusterUiConfig,
                    accountAttributes: current?.$attributes,
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

function AccountsBreadcrumbs() {
    // @ts-ignore
    const bcItems = useSelector(selectActiveAccountBreadcrumbs).slice(1);
    const dispatch = useDispatch();
    const cluster = useSelector(selectCluster);
    const history = useHistory();

    const handleBreadcrumbsClick = (key: string | number) => {
        dispatch(setActiveAccount(key === ROOT_PLACEHOLDER ? '' : key));
        const account = key === ROOT_PLACEHOLDER ? '' : key;
        const pathname = account
            ? window.location.pathname
            : calcRootPathname(window.location.pathname, cluster);
        history.push(makeRoutedURL(pathname, {account}));
    };

    const items = React.useMemo(() => {
        return [{text: ''}, ...bcItems].map((item) => {
            const account = item.text;
            const text = account || ROOT_PLACEHOLDER;

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
    }, [bcItems, cluster, window.location.pathname]);

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
