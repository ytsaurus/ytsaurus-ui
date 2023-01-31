import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import Favourites, {FavouritesItem} from '../../../components/Favourites/Favourites';
import {
    getFavouriteAccounts,
    isActiveAcountInFavourites,
} from '../../../store/selectors/favourites';
import {useDispatch, useSelector} from 'react-redux';
import {
    getAccountsMapByName,
    getActiveAccount,
} from '../../../store/selectors/accounts/accounts-ts';
import {setActiveAccount} from '../../../store/actions/accounts/accounts';
import {accountsToggleFavourite} from '../../../store/actions/favourites';
import {Breadcrumbs, BreadcrumbsItem} from '@gravity-ui/uikit';
import {getActiveAccountBreadcrumbs} from '../../../store/selectors/accounts/accounts';

import AccountCreate from '../tabs/general/Editor/AccountCreate';
import Link from '../../../components/Link/Link';
import {makeRoutedURL} from '../../../store/location';
import {Page} from '../../../constants';

import {getCluster, getClusterUiConfig} from '../../../store/selectors/global';
import {ACCOUNTS_ALLOWED_ROOT_TABS, AccountsTab} from '../../../constants/accounts/accounts';

import './AccountsTopRowContent.scss';
import UIFactory from '../../../UIFactory';

const block = cn('accounts-top-row-content');

function AccountsTopRowContent() {
    const clusterUiConfig = useSelector(getClusterUiConfig);
    const account = useSelector(getActiveAccount);
    const accountsByName = useSelector(getAccountsMapByName) as any;

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
    const isActiveInFavourites = useSelector(isActiveAcountInFavourites);
    const favourites = useSelector(getFavouriteAccounts);
    const dispatch = useDispatch();
    const activeAccount = useSelector(getActiveAccount);

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

interface BreadcrumbsItemType {
    text: string;
    url: string;
    title?: string;
}

function AccountsBreadcrumbs() {
    // @ts-ignore
    const bcItems = useSelector(getActiveAccountBreadcrumbs).slice(1);
    const dispatch = useDispatch();

    const handleItemClick = React.useCallback(
        (item: BreadcrumbsItemType) => {
            dispatch(setActiveAccount(item.text));
        },
        [dispatch, setActiveAccount],
    );

    const items = React.useMemo(() => {
        return [
            {
                text: '',
                action: () => handleItemClick({text: '', url: ''}),
            },
            ...bcItems.map((item) => {
                return {
                    ...item,
                    action: () => handleItemClick(item),
                };
            }),
        ];
    }, [bcItems, handleItemClick]);

    return (
        <Breadcrumbs
            className={block('breadcrumbs')}
            items={items}
            lastDisplayedItemsCount={2}
            firstDisplayedItemsCount={1}
            renderItemContent={renderBcItem}
        />
    );
}

function renderBcItem(item: BreadcrumbsItem, isCurrent: boolean) {
    return (
        <BreadcrumbLink account={item.text} title={item.text || '<Root>'} isCurrent={isCurrent} />
    );
}

interface BreadcrumbLinkProps {
    account: string;
    title?: string;
    isCurrent: boolean;
}

function BreadcrumbLink({account, title, isCurrent}: BreadcrumbLinkProps) {
    const cluster = useSelector(getCluster);
    const pathname = account
        ? window.location.pathname
        : calcRootPathname(window.location.pathname, cluster);
    const url = makeRoutedURL(pathname, {account});

    return (
        <Link
            className={block('breadcrumbs-item', {current: isCurrent})}
            theme={'ghost'}
            url={url}
            routed
        >
            {title || account}
        </Link>
    );
}

function calcRootPathname(pathname: string, cluster: string) {
    const isAllowedRootTab = _.some(ACCOUNTS_ALLOWED_ROOT_TABS, (_v, tab) => {
        return pathname.endsWith('/' + tab);
    });

    return isAllowedRootTab ? pathname : `/${cluster}/${Page.ACCOUNTS}/${AccountsTab.GENERAL}`;
}

export default React.memo(AccountsTopRowContent);
