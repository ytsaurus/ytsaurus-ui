import React from 'react';
import PropTypes from 'prop-types';

import hammer from '../../../../common/hammer';
import block from 'bem-cn-lite';

import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import Icon from '../../../../components/Icon/Icon';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';
import NodeQuad from '../../NodeQuad/NodeQuad';

import '../Schedulers.scss';

const b = block('system');

export default function Scheduler({host, state, maintenanceMessage}) {
    const theme = {
        active: 'online',
        connected: 'online',
        standby: 'banned',
        disconnected: 'banned',
        offline: 'offline',
    }[state];

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
                <div className={b('scheduler-host-address')}>{address}</div>
                <div className={b('scheduler-host-copy-btn')}>
                    <ClipboardButton view="flat-secondary" text={host} />
                </div>
            </div>
        </div>
    );
}

Scheduler.propTypes = {
    host: PropTypes.string.isRequired,
    state: PropTypes.oneOf(['offline', 'active', 'connected', 'standby', 'disconnected']),
    maintenanceMessage: PropTypes.string,
};
