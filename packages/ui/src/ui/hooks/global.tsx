import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import sortedIndexBy_ from 'lodash/sortedIndexBy';
import sortedLastIndexBy_ from 'lodash/sortedLastIndexBy';

import {getAllUserNamesSorted} from '../store/selectors/global';
import {
    loadAccountsIfNotLoaded,
    loadBundlesIfNotLoaded,
    loadGroupsIfNotLoaded,
    loadUsersIfNotLoaded,
} from '../store/actions/global';

export function useAllUserNamesFiltered() {
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(loadUsersIfNotLoaded());
    }, []);

    const namesSorted = useSelector(getAllUserNamesSorted);

    const getFiltered = React.useCallback(
        (text: string) => {
            const from = sortedIndexBy_(namesSorted, text, (item) => item.substr(0, text.length));
            const to = sortedLastIndexBy_(namesSorted, text, (item) => item.substr(0, text.length));
            const res = namesSorted.slice(from, to);
            return res;
        },
        [namesSorted],
    );

    return {getFiltered, allNames: namesSorted};
}

export function useGroupsLoaded() {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(loadGroupsIfNotLoaded());
    }, []);
}

export function GroupsLoader({children}: {children?: React.ReactElement}) {
    useGroupsLoaded();
    return children ?? null;
}

export function useAccountsLoaded() {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(loadAccountsIfNotLoaded());
    }, []);
}

export function AccountsLoader() {
    useAccountsLoaded();
    return null;
}

export function useBundlesLoaded() {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(loadBundlesIfNotLoaded());
    }, []);
}

export function BundlesLoader() {
    useBundlesLoaded();
    return null;
}
