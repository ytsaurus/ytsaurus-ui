import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {RadioButton} from '@gravity-ui/uikit';

import {PrometheusDashboardType} from '../../../../shared/prometheus/types';

import format from '../../../common/hammer/format';
import {PoolTreeSuggestControl} from '../../../components/Dialog/controls/PoolTreeSuggestControl/PoolTreeSuggestControl';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {PrometheusDashboardLazy} from '../../../containers/PrometheusDashboard/lazy';
import {getCluster} from '../../../store/selectors/global';
import {systemMonitoring} from '../../../store/reducers/system/monitoring';
import {useDefaultPoolTree} from '../../../hooks/global-pool-trees';

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
            <PrometheusDashboardLazy type={type} params={params} />
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

    const clusterResourcesExtra = useClusterResourcesExtraParams();

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
            case 'cluster-resources': {
                const {params, extraTools} = clusterResourcesExtra;
                const p = {cluster, ...params};
                return {
                    params: p,
                    extraTools,
                };
            }
            default: {
                const p = {cluster};
                return {params: p};
            }
        }
    }, [type, container, clusterResourcesExtra, cluster]);

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

function useClusterResourcesExtraParams() {
    const defaultTree = useDefaultPoolTree();
    const [tree, setTree] = React.useState<string | undefined>();

    React.useEffect(() => {
        if (defaultTree !== undefined) {
            setTree(defaultTree);
        }
    }, [defaultTree]);

    return React.useMemo(() => {
        return {
            params: tree !== undefined ? {tree} : undefined,
            extraTools: [
                {
                    node: (
                        <PoolTreeSuggestControl
                            value={tree !== undefined ? [tree] : []}
                            onChange={([value]) => {
                                setTree(value);
                            }}
                            placeholder={'Tree...'}
                        />
                    ),
                    width: 200,
                },
            ],
        };
    }, [tree]);
}
