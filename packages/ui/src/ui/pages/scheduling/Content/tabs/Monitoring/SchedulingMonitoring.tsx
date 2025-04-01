import React from 'react';
import {useSelector} from 'react-redux';

import {PrometheusDashboardLazy} from '../../../../../containers/PrometheusDashboard/lazy';

import {getCluster} from '../../../../../store/selectors/global';
import {getPool, getTree} from '../../../../../store/selectors/scheduling/scheduling';

export function SchedulingMonitoring() {
    const cluster = useSelector(getCluster);
    const pool = useSelector(getPool);
    const tree = useSelector(getTree);

    const params = React.useMemo(() => {
        return !cluster || !pool || !tree ? undefined : {cluster, tree, pool};
    }, [cluster, tree, pool]);

    return <PrometheusDashboardLazy type="scheduler-pool" params={params} />;
}
