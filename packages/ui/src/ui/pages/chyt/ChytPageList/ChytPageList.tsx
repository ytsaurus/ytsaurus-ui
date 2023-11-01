import React from 'react';
import {useDispatch} from 'react-redux';

import {useUpdater} from '../../../hooks/use-updater';

import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';

import {chytLoadList} from '../../../store/actions/chyt/list';

import ChytPageListToolbar from './ChytPageListToolbar';
import ChytPageListTable from './ChytPageListTable';

export function ChytPageList() {
    const dispatch = useDispatch();
    const update = React.useCallback(() => {
        dispatch(chytLoadList());
    }, [dispatch]);

    useUpdater(update);

    return <WithStickyToolbar toolbar={<ChytPageListToolbar />} content={<ChytPageListTable />} />;
}
