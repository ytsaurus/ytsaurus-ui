import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';

import {getAllUserNamesSorted} from '../store/selectors/global';
import {
    loadAccountsIfNotLoaded,
    loadBundlesIfNotLoaded,
    loadGroupsIfNotLoaded,
    loadPoolTreesIfNotLoaded,
    loadUsersIfNotLoaded,
} from '../store/actions/global';

export function useAllUserNamesFiltered() {
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(loadUsersIfNotLoaded());
    }, []);

    const namesSorted = useSelector(getAllUserNamesSorted);

    const getFiltered = useCallback(
        (text: string) => {
            const from = _.sortedIndexBy(namesSorted, text, (item) => item.substr(0, text.length));
            const to = _.sortedLastIndexBy(namesSorted, text, (item) =>
                item.substr(0, text.length),
            );
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

export function usePoolTreesLoaded() {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(loadPoolTreesIfNotLoaded());
    }, []);
}

export function PoolTreesLoader() {
    usePoolTreesLoaded();
    return null;
}
