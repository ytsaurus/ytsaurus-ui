import React, {useCallback} from 'react';

import hammer from '../../../../common/hammer';
import block from 'bem-cn-lite';

import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import Icon from '../../../../components/Icon/Icon';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';
import NodeQuad from '../../NodeQuad/NodeQuad';

import '../Schedulers.scss';
import {ChangeMaintenanceButton} from '../../Masters/ChangeMaintenanceButton';
import {makeShortSystemAddress} from '../../helpers/makeShortSystemAddress';
import {useDispatch} from '../../../../store/redux-hooks';
import {changeSchedulerMaintenance} from '../../../../store/actions/system/schedulers';

const b = block('system');

export type SchedulerProps = {
    host: string;
    address: string;
    physicalHost: string;
    state: 'active' | 'connected' | 'standby' | 'disconnected' | 'offline';
    maintenanceMessage?: React.ReactNode;
    type: 'schedulers' | 'agents';
};

export default function Scheduler({
    host,
    physicalHost,
    address,
    state,
    maintenanceMessage,
    type,
}: SchedulerProps) {
    const dispatch = useDispatch();
    const theme = (
        {
            active: 'online',
            connected: 'online',
            standby: 'banned',
            disconnected: 'banned',
            offline: 'offline',
        } as const
    )[state];

    const formatedAddress = hammer.format['Address'](address);
    const path = `//sys/${type === 'schedulers' ? 'scheduler' : 'controller_agents'}/instances/${host}`;

    const handleOnMaintenanceChange = useCallback(
        async (data: {path: string; message: string; maintenance: boolean}) => {
            await dispatch(changeSchedulerMaintenance(data));
        },
        [dispatch],
    );

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
            <div title={formatedAddress} className={b('scheduler-host')}>
                <Tooltip content={formatedAddress} ellipsis>
                    <div className={b('scheduler-host-address')}>
                        {makeShortSystemAddress(formatedAddress) || formatedAddress}
                    </div>
                </Tooltip>
                <div className={b('scheduler-host-btn')}>
                    {host && <ClipboardButton view="flat-secondary" text={host} />}
                </div>
                <ChangeMaintenanceButton
                    className={b('scheduler-host-btn')}
                    path={path}
                    title={`Edit ${address}`}
                    host={physicalHost}
                    container={host}
                    maintenance={Boolean(maintenanceMessage)}
                    maintenanceMessage={maintenanceMessage as string}
                    onMaintenanceChange={handleOnMaintenanceChange}
                />
            </div>
        </div>
    );
}
