import React from 'react';
import isEmpty_ from 'lodash/isEmpty';

import hammer from '../../../common/hammer';
import Label from '../../../components/Label';
import {MaintenanceRequests} from '../../../components/MaintenanceRequests/MaintenanceRequests';
import {type MetaTableItem} from '@ytsaurus/components';
import {renderLabel} from '../../../components/templates/components/nodes/nodes';
import {type Node} from '../../../store/reducers/components/nodes/nodes/node';
import i18n from './i18n';

function getStateTheme(state: Node['state']) {
    switch (state) {
        case 'online':
            return 'success';
        case 'offline':
            return 'danger';
        default:
            return 'default';
    }
}

export function getNodeMetaItems({
    alertCount,
    banned,
    banMessage,
    dataCenter,
    decommissioned,
    decommissionedMessage,
    disableJobs,
    disableWriteSession,
    disableTabletCells,
    full,
    jobProxyBuildVersion,
    lastSeenTime,
    maintenanceRequests,
    state,
    rack,
    registerTime,
    version,
}: Pick<
    Node,
    | 'alertCount'
    | 'banned'
    | 'banMessage'
    | 'dataCenter'
    | 'decommissioned'
    | 'decommissionedMessage'
    | 'disableJobs'
    | 'disableWriteSession'
    | 'disableTabletCells'
    | 'full'
    | 'jobProxyBuildVersion'
    | 'lastSeenTime'
    | 'registerTime'
    | 'maintenanceRequests'
    | 'state'
    | 'rack'
    | 'version'
>): Array<MetaTableItem> {
    const stateText = hammer.format['FirstUppercase'](state);
    const stateTheme = getStateTheme(state);
    return [
        {
            key: 'state',
            label: i18n('field_state'),
            value: <Label theme={stateTheme} type="text" text={stateText} />,
        },
        {
            key: 'rack',
            label: i18n('field_rack'),
            value: hammer.format['Address'](rack),
            visible: Boolean(rack),
        },
        {
            key: 'banned',
            label: i18n('field_banned'),
            value: (
                <Label
                    text={banMessage || i18n('value_true')}
                    theme={!banMessage ? 'danger' : 'warning'}
                    type="text"
                />
            ),
            visible: Boolean(banned),
        },
        {
            key: 'maintenance',
            label: i18n('field_maintenance'),
            value: <MaintenanceRequests requests={maintenanceRequests} />,
            visible: !isEmpty_(maintenanceRequests),
        },
        {
            key: 'decommissioned',
            label: i18n('field_decommissioned'),
            value: (
                <Label
                    text={
                        decommissionedMessage ? decommissionedMessage : i18n('value_decommissioned')
                    }
                    theme="default"
                    type="text"
                />
            ),
            visible: Boolean(decommissioned),
        },
        {
            key: 'full',
            label: i18n('field_full'),
            value: <Label text={i18n('value_full')} theme="danger" type="text" />,
            visible: Boolean(full),
        },
        {
            key: 'alerts',
            label: i18n('field_alerts'),
            value: <Label text={alertCount} theme="danger" type="text" />,
            visible: alertCount! > 0,
        },
        {
            key: 'scheduler_jobs',
            label: i18n('field_scheduler-jobs'),
            value: renderLabel(disableJobs),
        },
        {
            key: 'write_sessions',
            label: i18n('field_write-sessions'),
            value: renderLabel(disableWriteSession),
        },
        {
            key: 'tablet_cells',
            label: i18n('field_tablet-cells'),
            value: renderLabel(disableTabletCells),
        },
        {
            key: 'data_center',
            label: i18n('field_data-center'),
            value: dataCenter?.toUpperCase(),
            visible: Boolean(dataCenter),
        },
        {
            key: 'last_seen',
            label: i18n('field_last-seen'),
            value: hammer.format['DateTime'](lastSeenTime, {
                format: 'full',
            }),
        },
        {
            key: 'register_time',
            label: i18n('field_register-time'),
            value: hammer.format['DateTime'](registerTime, {
                format: 'full',
            }),
        },
        {
            key: 'version',
            label: i18n('field_version'),
            value: version,
            visible: Boolean(version),
        },
        {
            key: 'job_proxy_build_version',
            label: i18n('field_job-proxy-build-version'),
            value: jobProxyBuildVersion,
            visible: Boolean(jobProxyBuildVersion),
        },
    ];
}
