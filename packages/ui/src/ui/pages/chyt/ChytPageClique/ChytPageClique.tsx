import React from 'react';
import {useDispatch} from 'react-redux';
import {RouteComponentProps} from 'react-router';

import {useUpdater} from '../../../hooks/use-updater';
import {chytCliqueLoad} from '../../../store/actions/chyt/clique';

export function ChytPageClique(props: RouteComponentProps<{alias: string}>) {
    const {alias} = props.match.params;
    const dispatch = useDispatch();

    const update = React.useCallback(() => {
        dispatch(chytCliqueLoad(alias));
    }, [alias]);

    useUpdater(update);

    return <div>Chyt clique page {alias}</div>;
}
