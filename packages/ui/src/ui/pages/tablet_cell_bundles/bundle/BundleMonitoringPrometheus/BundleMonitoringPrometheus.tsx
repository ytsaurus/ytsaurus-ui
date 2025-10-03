import React from 'react';
import cn from 'bem-cn-lite';

import {RadioButton} from '@gravity-ui/uikit';

import {HEADER_HEIGHT} from '../../../../constants';
import {StickyContainer} from '../../../../components/StickyContainer/StickyContainer';
import {PrometheusDashboardLazy} from '../../../../containers/PrometheusDashboard/lazy';
import type {BundleMonitoringProps} from '../../../../UIFactory';
import {
    TOOLBAR_COMPONENT_HEIGHT,
    Toolbar,
} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {usePrometheusDashboardType} from '../../../../store/reducers/prometheusDashboard/prometheusDahsboard';

import './BundleMonitoringPrometheus.scss';

const block = cn('yt-bundle-monitoring-prometheus');

const BUNDLE_DASHBOARDS = {
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

const BUNDLE_DASHBOARDS_NAMES = Object.keys(BUNDLE_DASHBOARDS) as Array<
    keyof typeof BUNDLE_DASHBOARDS
>;

export function BundleMonitoringPrometheus(props: BundleMonitoringProps) {
    const {type, setType, params} = useBundleMonitoring(props);
    return (
        <StickyContainer>
            {({stickyTopClassName}) => {
                return (
                    <React.Fragment>
                        <Toolbar
                            className={block('toolbar', stickyTopClassName)}
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
                        <PrometheusDashboardLazy
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

function useBundleMonitoring({cluster, tablet_cell_bundle}: BundleMonitoringProps) {
    const {type, setType} = usePrometheusDashboardType(BUNDLE_DASHBOARDS_NAMES);

    return {
        type,
        setType,
        params: {
            cluster,
            tablet_cell_bundle,
            proxy_role: tablet_cell_bundle,
        },
    };
}
