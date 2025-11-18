import React from 'react';
import {useDispatch, useSelector} from '../store/redux-hooks';

import {loadPoolTreesIfNotLoaded} from '../store/actions/global';
import {getTree} from '../store/selectors/scheduling/scheduling';
import {loadDefaultPoolTree} from '../utils/poolTrees';

export function usePoolTreesLoaded() {
    const dispatch = useDispatch();

    React.useEffect(() => {
        dispatch(loadPoolTreesIfNotLoaded());
    }, [dispatch]);
}

export function PoolTreesLoader() {
    usePoolTreesLoaded();
    return null;
}

export function useDefaultPoolTree() {
    const [defaultPoolTree, setDefaultPoolTree] = React.useState<string | undefined>();

    React.useEffect(() => {
        loadDefaultPoolTree().then((value) => {
            setDefaultPoolTree(value);
        });
    }, []);

    return defaultPoolTree;
}

export function usePoolTreeOrDefaultPoolTree() {
    const tree = useSelector(getTree);
    const defaultTree = useDefaultPoolTree();
    return tree || defaultTree;
}

export function WaitForDefaultPoolTree({
    children,
}: {
    children: ({defaultPoolTree}: {defaultPoolTree: string}) => React.ReactNode;
}) {
    const defaultPoolTree = useDefaultPoolTree();

    return defaultPoolTree ? children({defaultPoolTree}) : null;
}
