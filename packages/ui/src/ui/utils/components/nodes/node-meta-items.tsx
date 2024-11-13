import React from 'react';
import cn from 'bem-cn-lite';
import map_ from 'lodash/map';

import hammer from '../../../common/hammer';
import Label from '../../../components/Label/Label';
import {MetaTableItem} from '../../../components/MetaTable/MetaTable';
import {renderLabel} from '../../../components/templates/components/nodes/nodes';
import type {MaintenanceRequestInfo} from '../../../store/actions/components/node-maintenance-modal';
import type {Node} from '../../../store/reducers/components/nodes/nodes/node';

import './node-meta-items.scss';

const block = cn('yt-node-meta-items');

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
    lastSeenTime,
    maintenanceRequests,
    state,
    rack,
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
    | 'lastSeenTime'
    | 'maintenanceRequests'
    | 'state'
    | 'rack'
>): Array<MetaTableItem> {
    const stateText = hammer.format['FirstUppercase'](state);
    const stateTheme = getStateTheme(state);

    const maintenanceMessage = calcNodeMaintenanceMessage(maintenanceRequests);

    return [
        {
            key: 'state',
            value: <Label theme={stateTheme} type="text" text={stateText} />,
        },
        {
            key: 'rack',
            value: hammer.format['Address'](rack),
            visible: Boolean(rack),
        },
        {
            key: 'banned',
            value: (
                <Label
                    text={banMessage || 'True'}
                    theme={!banMessage ? 'danger' : 'warning'}
                    type="text"
                />
            ),
            visible: Boolean(banned),
        },
        {
            key: 'maintenance',
            value: (
                <Label
                    className={block('maintenance')}
                    theme="warning"
                    type="text"
                    text={maintenanceMessage}
                />
            ),
            visible: maintenanceMessage.length > 0,
        },
        {
            key: 'decommissioned',
            value: (
                <Label
                    text={decommissionedMessage ? decommissionedMessage : 'Decommissioned'}
                    theme="default"
                    type="text"
                />
            ),
            visible: Boolean(decommissioned),
        },
        {
            key: 'full',
            value: <Label text="Full" theme="danger" type="text" />,
            visible: Boolean(full),
        },
        {
            key: 'alerts',
            value: <Label text={alertCount} theme="danger" type="text" />,
            visible: alertCount! > 0,
        },
        {
            key: 'scheduler_jobs',
            value: renderLabel(disableJobs),
        },
        {
            key: 'write_sessions',
            value: renderLabel(disableWriteSession),
        },
        {
            key: 'tablet_cells',
            value: renderLabel(disableTabletCells),
        },
        {
            key: 'data_center',
            value: dataCenter?.toUpperCase(),
            visible: Boolean(dataCenter),
        },
        {
            key: 'last_seen',
            value: hammer.format['DateTime'](lastSeenTime, {
                format: 'full',
            }),
        },
    ];
}

export function calcNodeMaintenanceMessage(items?: Array<MaintenanceRequestInfo>) {
    return (
        map_(items, ({type, user, comment}) => {
            return `${type} by ${user}: ${comment}`;
        })
            .sort()
            .join('\n') ?? ''
    );
}
