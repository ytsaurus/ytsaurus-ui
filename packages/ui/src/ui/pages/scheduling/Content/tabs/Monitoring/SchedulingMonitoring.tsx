import React from 'react';
import {useSelector} from 'react-redux';

import {PrometheusDashboardLazy} from '../../../../../containers/PrometheusDashboard/lazy';

import {selectCluster} from '../../../../../store/selectors/global';
import {selectPool, selectTree} from '../../../../../store/selectors/scheduling/scheduling';

export function SchedulingMonitoring() {
    const cluster = useSelector(selectCluster);
    const pool = useSelector(selectPool);
    const tree = useSelector(selectTree);

    const params = React.useMemo(() => {
        return !cluster || !pool || !tree ? undefined : {cluster, tree, pool};
    }, [cluster, tree, pool]);

    return <PrometheusDashboardLazy type="scheduler-pool" params={params} />;
}
