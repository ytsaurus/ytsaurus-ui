import React from 'react';
import {useSelector} from 'react-redux';

import {RadioButton} from '@gravity-ui/uikit';

import {PrometheusDashboardType} from '../../../../shared/prometheus/types';

import format from '../../../common/hammer/format';
import {PrometheusDashboardLazy} from '../../../containers/PrometheusDashboard/lazy';
import {getCluster} from '../../../store/selectors/global';
import {
    usePrometheusDashboardParams,
    usePrometheusDashboardType,
} from '../../../store/reducers/prometheusDashboard/prometheusDashboard-hooks';
import {useDefaultPoolTree} from '../../../hooks/global-pool-trees';

const SYSTEM_DASHBOARDS: Array<PrometheusDashboardType> = [
    'scheduler-internal',
    'cluster-resources',
    'master-global',
    'master-local',
];

export function SystemMonitoringPrometheus() {
    const {type, setType, params} = useSystemDashboardParameters();
    return (
        <React.Fragment>
            <PrometheusDashboardLazy
                key={type}
                type={type}
                params={params}
                toolbarItems={[
                    {
                        node: (
                            <RadioButton
                                value={type}
                                onUpdate={setType}
                                options={SYSTEM_DASHBOARDS.map((item) => ({
                                    value: item,
                                    content: format.ReadableField(item.replace(/-/g, '_')),
                                }))}
                            />
                        ),
                    },
                ]}
            />
        </React.Fragment>
    );
}

function useSystemDashboardParameters() {
    const cluster = useSelector(getCluster);

    const {type, setType} = usePrometheusDashboardType(SYSTEM_DASHBOARDS);
    const {params, setParams} = usePrometheusDashboardParams<{tree?: string}>(type);

    const defaultTree = useDefaultPoolTree();
    React.useEffect(() => {
        if (defaultTree !== undefined) {
            setParams({tree: defaultTree});
        }
    }, [defaultTree, setParams]);

    const {effectiveParams} = React.useMemo(() => {
        return {effectiveParams: {cluster, ...params}};
    }, [params, cluster]);

    return {
        type,
        setType,
        params: effectiveParams,
    };
}
