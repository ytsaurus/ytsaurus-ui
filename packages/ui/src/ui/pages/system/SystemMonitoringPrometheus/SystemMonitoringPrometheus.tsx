import React from 'react';
import {useSelector} from 'react-redux';

import {RadioButton} from '@gravity-ui/uikit';

import {PrometheusDashboardType} from '../../../../shared/prometheus/types';

import format from '../../../common/hammer/format';
import {PoolTreeSuggestControl} from '../../../components/Dialog/controls/PoolTreeSuggestControl/PoolTreeSuggestControl';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {PrometheusDashboardLazy} from '../../../containers/PrometheusDashboard/lazy';
import {getCluster} from '../../../store/selectors/global';
import {
    usePrometheusDashboardParams,
    usePrometheusDashboardType,
} from '../../../store/reducers/prometheusDashboard/prometheusDashboard-hooks';
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
    const {type, setType, params, extraTools} = useSystemDashboardParameters();
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
            <PrometheusDashboardLazy key={type} type={type} params={params} />
        </React.Fragment>
    );
}

type ViewParams = {
    container?: string;
};

function useSystemDashboardParameters() {
    const cluster = useSelector(getCluster);

    const {type, setType} = usePrometheusDashboardType(SYSTEM_DASHBOARDS);
    const {
        params: {container = ALL_PODS},
        setParams: setViewParams,
    } = usePrometheusDashboardParams<ViewParams>(type);

    const clusterResourcesExtra = useClusterResourcesExtraParams();

    const {params, extraTools} = React.useMemo(() => {
        switch (type) {
            case 'master-local':
                return {
                    params: {cluster, pod: container},
                    extraTools: [
                        {
                            node: (
                                <MasterLocalContainers
                                    key="pod"
                                    allValue={ALL_PODS}
                                    container={container}
                                    setContainer={(v) => {
                                        setViewParams({container: v});
                                    }}
                                />
                            ),
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
        setType,
        container,
        setContainer: (v: string) => setViewParams({container: v}),
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
