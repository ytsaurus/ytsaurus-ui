import React from 'react';
import {useSelector} from 'react-redux';

import {getCluster} from '../../../../../store/selectors/global';
import {getPool, getTree} from '../../../../../store/selectors/scheduling/scheduling';
import {PrometheusDashboard} from './PrometheusDashboard';

export function SchedulingMonitoring() {
    const cluster = useSelector(getCluster);
    const pool = useSelector(getPool);
    const tree = useSelector(getTree);

    const params = React.useMemo(() => {
        return {cluster, tree, pool};
    }, [cluster, tree, pool]);

    return <PrometheusDashboard type="scheduler-pool" params={params} />;
}
