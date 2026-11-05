import React, {useLayoutEffect, useState} from 'react';
import {type Meta} from '@storybook/react';

import {AccountsGeneralTab} from '../AccountsGeneralTab';
import {AccountEditorHost} from '../../../../AccountEditorDialog';
import AccountsUpdater from '../../../../Accounts/AccountsUpdater';
import {useDispatch} from '../../../../../../store/redux-hooks';
import {GLOBAL_PARTIAL} from '../../../../../../constants/global';
import {UPDATE_SETTING_DATA} from '../../../../../../constants';
import {
    changeContentFilter,
    reloadAccounts,
    setAccountsAbcServiceFilter,
    setActiveAccount,
} from '../../../../../../store/actions/accounts/accounts';
import {accountBatch, accountList, defaultAccounts, defaultUsable, emptyTotals} from './mocks';
import {mockYTApi} from '../../../../../../playwright-components/core/mockYTApi';
import {mockSettings} from '../../../../../../playwright-components/core/mockSettings';
import {YTApiId} from '../../../../../../../shared/constants/yt-api-id';

const [parent, child, usableOnly] = defaultAccounts;

const defaultFavourites = ['child'];

export function Tree({
    initialMode = 'usable',
    viewContext = 'accounts',
    activeAccount = '',
    favourites = defaultFavourites,
    abcSlug,
}: {
    initialMode?: 'all' | 'usable' | 'favourites';
    viewContext?: 'accounts' | 'dashboard';
    activeAccount?: string;
    favourites?: string[];
    abcSlug?: string;
}) {
    const dispatch = useDispatch();
    const [ready, setReady] = useState(false);

    useLayoutEffect(() => {
        dispatch({type: GLOBAL_PARTIAL, data: {mediumList: ['default']}});
        dispatch({
            type: UPDATE_SETTING_DATA,
            data: {
                'global::accounts::visibilityMode': initialMode,
                'local::test-cluster::accounts::favourites': favourites.map((path) => ({path})),
            },
        });
        dispatch(changeContentFilter('nodes'));
        setReady(true);
    }, [dispatch, initialMode, favourites]);

    useLayoutEffect(() => {
        dispatch(setActiveAccount(activeAccount));
    }, [dispatch, activeAccount]);

    useLayoutEffect(() => {
        dispatch(setAccountsAbcServiceFilter(undefined, abcSlug));
    }, [dispatch, abcSlug]);

    return (
        <div style={{width: 1100}}>
            <button onClick={() => dispatch(reloadAccounts())}>Refresh accounts</button>
            {ready && (
                <AccountEditorHost>
                    <AccountsUpdater />
                    <AccountsGeneralTab viewContext={viewContext} />
                </AccountEditorHost>
            )}
        </div>
    );
}

export default {
    title: 'Pages/Accounts/AccountsGeneralTab',
    component: Tree,
    args: {favourites: defaultUsable},
    parameters: {
        msw: {
            handlers: [
                mockSettings({
                    'local::test-cluster::accounts::favourites': defaultUsable.map((path) => ({
                        path,
                    })),
                }),
                mockYTApi(YTApiId.accountsListData, {data: accountList(defaultAccounts)}),
                mockYTApi(YTApiId.accountsData, {data: defaultAccounts}),
                mockYTApi(YTApiId.listUsableAccounts, {data: defaultUsable}),
                mockYTApi(YTApiId.accountsTotals, {data: emptyTotals}),
                mockYTApi(YTApiId.accountsNodes, {data: {}}),
                mockYTApi(YTApiId.accountsSelectedMetadata, {
                    data: accountBatch([child, parent, usableOnly]),
                }),
            ],
        },
    },
} satisfies Meta<typeof Tree>;
