import React from 'react';
import {useDispatch} from '../../../store/redux-hooks';

import {useClusterFromLocation} from '../../../hooks/use-cluster';
import {useUpdater} from '../../../hooks/use-updater';

import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';

import {chytLoadList} from '../../../store/actions/chyt/list';

import ChytPageListToolbar from './ChytPageListToolbar/ChytPageListToolbar';
import ChytPageListTable from './ChytPageListTable/ChytPageListTable';

export function ChytPageList() {
    const dispatch = useDispatch();
    const cluster = useClusterFromLocation();
    const update = React.useCallback(() => {
        dispatch(chytLoadList(cluster));
    }, [cluster, dispatch]);

    useUpdater(update);

    return (
        <WithStickyToolbar
            hideToolbarShadow
            toolbar={<ChytPageListToolbar />}
            content={<ChytPageListTable />}
        />
    );
}
