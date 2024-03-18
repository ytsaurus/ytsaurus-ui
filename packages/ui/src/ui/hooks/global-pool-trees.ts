import React from 'react';
import {useDispatch} from 'react-redux';

import {loadPoolTreesIfNotLoaded} from '../store/actions/global';
import {loadDefaultPoolTree} from '../utils/poolTrees';

function usePoolTreesLoaded() {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(loadPoolTreesIfNotLoaded());
    }, [dispatch]);
}

export function PoolTreesLoader() {
    usePoolTreesLoaded();
    return null;
}

export function WaitForDefaultPoolTree({
    children,
}: {
    children: ({defaultPoolTree}: {defaultPoolTree: string}) => React.ReactNode;
}) {
    const [defaultPoolTree, setDefaultPoolTree] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
        loadDefaultPoolTree().then((value) => {
            setDefaultPoolTree(value);
        });
    }, []);

    return defaultPoolTree ? children({defaultPoolTree}) : null;
}
