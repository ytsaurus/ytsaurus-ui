import React from 'react';

import hammer from '../../../../common/hammer';
import block from 'bem-cn-lite';

import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import Icon from '../../../../components/Icon/Icon';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';
import NodeQuad from '../../NodeQuad/NodeQuad';

import '../Schedulers.scss';
import {ChangeMaintenanceButton} from '../../Masters/ChangeMaintenanceButton';
import {calcShortNameByRegExp} from '../../../../containers/Host/Host';

const b = block('system');

export type SchedulerProps = {
    host?: string;
    state: 'active' | 'connected' | 'standby' | 'disconnected' | 'offline';
    maintenanceMessage?: React.ReactNode;
    type: 'scheduler' | 'agent';
};
export default function Scheduler({host, state, maintenanceMessage, type}: SchedulerProps) {
    const theme = (
        {
            active: 'online',
            connected: 'online',
            standby: 'banned',
            disconnected: 'banned',
            offline: 'offline',
        } as const
    )[state];

    const address = hammer.format['Address'](host);

    return (
        <div className={b('scheduler')}>
            <NodeQuad theme={theme} />
            <div className={b('scheduler-status')}>{hammer.format['ReadableField'](state)}</div>
            <div className={b('maintenance')}>
                {maintenanceMessage && (
                    <Tooltip content={maintenanceMessage}>
                        <Icon awesome="digging" face="solid" />
                    </Tooltip>
                )}
            </div>
            <div title={address} className={b('scheduler-host')}>
                <Tooltip content={address}>
                    <div className={b('scheduler-host-address')}>
                        {calcShortNameByRegExp(address) || address}
                    </div>
                </Tooltip>
                <div className={b('scheduler-host-btn')}>
                    {host && <ClipboardButton view="flat-secondary" text={host} />}
                </div>
                <ChangeMaintenanceButton
                    className={b('scheduler-host-btn')}
                    address={host!}
                    maintenance={Boolean(maintenanceMessage)}
                    maintenanceMessage={maintenanceMessage as string}
                    type={type}
                />
            </div>
        </div>
    );
}
