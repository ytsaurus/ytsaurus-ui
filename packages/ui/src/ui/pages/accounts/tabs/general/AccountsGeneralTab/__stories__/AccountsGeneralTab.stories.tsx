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
    setActiveAccount,
} from '../../../../../../store/actions/accounts/accounts';
import {createAccountsMock} from './mocks';

const defaultFavourites = ['child'];

export function Tree({
    initialMode = 'usable',
    viewContext = 'accounts',
    activeAccount = '',
    favourites = defaultFavourites,
}: {
    initialMode?: 'all' | 'usable' | 'favourites';
    viewContext?: 'accounts' | 'dashboard';
    activeAccount?: string;
    favourites?: string[];
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
        dispatch(setActiveAccount(activeAccount));
        dispatch(changeContentFilter('nodes'));
        setReady(true);
    }, [dispatch, initialMode, activeAccount, favourites]);

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
    parameters: {msw: {handlers: createAccountsMock().handlers}},
} satisfies Meta<typeof Tree>;
