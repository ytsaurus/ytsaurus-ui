import React from 'react';
import cn from 'bem-cn-lite';

import {RadioButton} from '@gravity-ui/uikit';

import {HEADER_HEIGHT} from '../../../../constants';
import {StickyContainer} from '../../../../components/StickyContainer/StickyContainer';
import {PrometheusDashboard} from '../../../../containers/PrometheusDashboard/PrometheusDashboard';
import {PrometheusDashboardType} from '../../../../store/reducers/prometheusDashboard/prometheusDahsboard';
import type {BundleMonitoringProps} from '../../../../UIFactory';
import {
    TOOLBAR_COMPONENT_HEIGHT,
    Toolbar,
} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';

import './BundleMonitoringPrometheus.scss';

const block = cn('yt-bundle-monitoring-prometheus');

const BUNDLE_DASHBOARDS: Partial<Record<PrometheusDashboardType, {title: string}>> = {
    'bundle-ui-user-load': {title: 'User load'},
    'bundle-ui-resource': {title: 'Resources'},
    'bundle-ui-cpu': {title: 'CPU'},
    'bundle-ui-memory': {title: 'Memory'},
    'bundle-ui-disk': {title: 'Disk'},
    'bundle-ui-lsm': {title: 'LSM'},
    'bundle-ui-network': {title: 'Network'},
    'bundle-ui-efficiency': {title: 'Efficiency'},
    'bundle-ui-rpc-proxy-overview': {title: 'Proxy resources'},
    'bundle-ui-rpc-proxy': {title: 'Proxy details'},
};

export function BundleMonitoringPrometheus(props: BundleMonitoringProps) {
    const {type, setType, params} = useBundleMonitoring(props);
    return (
        <StickyContainer>
            {({topStickyClassName}) => {
                return (
                    <React.Fragment>
                        <Toolbar
                            className={block('toolbar', topStickyClassName)}
                            itemsToWrap={[
                                {
                                    node: (
                                        <RadioButton
                                            value={type}
                                            onUpdate={setType}
                                            options={Object.keys(BUNDLE_DASHBOARDS).map((k) => {
                                                const key = k as keyof typeof BUNDLE_DASHBOARDS;
                                                return {
                                                    value: key,
                                                    content: BUNDLE_DASHBOARDS[key]?.title,
                                                };
                                            })}
                                        />
                                    ),
                                },
                            ]}
                        />
                        <PrometheusDashboard
                            type={type}
                            params={params}
                            toolbarStickyTop={HEADER_HEIGHT + TOOLBAR_COMPONENT_HEIGHT}
                        />
                    </React.Fragment>
                );
            }}
        </StickyContainer>
    );
}

/*
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

*/

function useBundleMonitoring({cluster, tablet_cell_bundle}: BundleMonitoringProps) {
    const [type, setType] = React.useState<PrometheusDashboardType>(
        Object.keys(BUNDLE_DASHBOARDS)[0] as PrometheusDashboardType,
    );

    return {
        type,
        setType,
        params: {
            cluster,
            tablet_cell_bundle,
        },
    };
}
