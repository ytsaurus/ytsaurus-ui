import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {RadioButton} from '@gravity-ui/uikit';

import {PrometheusDashboardType} from '../../../../shared/prometheus/types';

import format from '../../../common/hammer/format';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {PrometheusDashboard} from '../../../containers/PrometheusDashboard/PrometheusDashboard';
import {getCluster} from '../../../store/selectors/global';
import {systemMonitoring} from '../../../store/reducers/system/monitoring';

import {MasterLocalContainers} from './MasterLocalContainers';

const SYSTEM_DASHBOARDS: Array<PrometheusDashboardType> = [
    'scheduler-internal',
    'cluster-resources',
    'master-global',
    'master-local',
];

const ALL_PODS = '.*';

export function SystemMonitoringPrometheus() {
    const {type, setType, params, extraTools} = useDashboardParameters();
    return (
        <React.Fragment>
            <Toolbar
                itemsToWrap={[
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
                    ...(extraTools ?? []),
                ]}
            />
            <PrometheusDashboard type={type} params={params} />
        </React.Fragment>
    );
}

function useDashboardParameters() {
    const dispatch = useDispatch();
    const cluster = useSelector(getCluster);
    const type =
        (useSelector(systemMonitoring.selectors.getActiveTab) as PrometheusDashboardType) ??
        SYSTEM_DASHBOARDS[0];
    const container =
        useSelector(systemMonitoring.selectors.getMasterLocalContainer) ?? SYSTEM_DASHBOARDS[0];

    const {params, extraTools} = React.useMemo(() => {
        switch (type) {
            case 'master-local':
                return {
                    params: {cluster, pod: container},
                    extraTools: [
                        {
                            node: <MasterLocalContainers key="pod" allValue={ALL_PODS} />,
                        },
                    ],
                };
            default: {
                const p = {cluster};
                return {params: p as typeof p};
            }
        }
    }, [type, container, cluster]);

    return {
        type,
        setType: (v: typeof type) => dispatch(systemMonitoring.actions.onUpdate({activeTab: v})),
        container,
        setContainer: (v: string) =>
            dispatch(systemMonitoring.actions.onUpdate({masterLocalContainer: v})),
        params,
        extraTools,
    };
}
