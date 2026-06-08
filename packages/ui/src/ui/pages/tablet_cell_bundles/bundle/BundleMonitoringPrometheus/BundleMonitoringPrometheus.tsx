import React from 'react';
import cn from 'bem-cn-lite';

import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {HEADER_HEIGHT} from '../../../../constants';
import {StickyContainer} from '../../../../components/StickyContainer/StickyContainer';
import {PrometheusDashboardLazy} from '../../../../containers/PrometheusDashboard/lazy';
import {type BundleMonitoringProps} from '../../../../UIFactory';
import {
    TOOLBAR_COMPONENT_HEIGHT,
    Toolbar,
} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {usePrometheusDashboardType} from '../../../../store/reducers/prometheusDashboard/prometheusDashboard-hooks';
import i18n from './i18n';

import './BundleMonitoringPrometheus.scss';

const block = cn('yt-bundle-monitoring-prometheus');

const BUNDLE_DASHBOARDS = {
    'bundle-ui-user-load': {
        get title() {
            return i18n('title_user-load');
        },
    },
    'bundle-ui-resource': {
        get title() {
            return i18n('title_resources');
        },
    },
    'bundle-ui-cpu': {title: 'CPU'},
    'bundle-ui-memory': {
        get title() {
            return i18n('title_memory');
        },
    },
    'bundle-ui-disk': {
        get title() {
            return i18n('title_disk');
        },
    },
    'bundle-ui-lsm': {title: 'LSM'},
    'bundle-ui-network': {
        get title() {
            return i18n('title_network');
        },
    },
    'bundle-ui-efficiency': {
        get title() {
            return i18n('title_efficiency');
        },
    },
    'bundle-ui-rpc-proxy-overview': {
        get title() {
            return i18n('title_proxy-resources');
        },
    },
    'bundle-ui-rpc-proxy': {
        get title() {
            return i18n('title_proxy-details');
        },
    },
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
                                        <SegmentedRadioGroup
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
