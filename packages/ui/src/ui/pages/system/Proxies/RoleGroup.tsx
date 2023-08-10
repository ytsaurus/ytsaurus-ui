import React from 'react';
import cn from 'bem-cn-lite';
import {Link, Text} from '@gravity-ui/uikit';

import './RoleGroup.scss';

import {ProgressCircle} from '../../../components/ProgressCircle/ProgressCircle';

import type {RoleGroupInfo} from '../../../store/reducers/system/proxies';
import format from '../../../common/hammer/format';

const block = cn('yt-role-group');

export function RoleGroup({
    data: {name, total, effectiveStates},
    url,
    showAlerts,
    showDecomissioned,
}: {
    data: RoleGroupInfo;
    url: string;
    showAlerts?: boolean;
    showDecomissioned?: boolean;
}) {
    const {online, offline, banned} = effectiveStates;
    return (
        <Link href={url} className={block()}>
            <Text className={block('name')} color="primary" variant="body-3" ellipsis>
                {name}
            </Text>
            <div className={block('progress')}>
                <div className={block('progress-text')}>
                    <div>
                        <Text color="secondary">TOTAL SERVERS IN RACK</Text>
                    </div>
                    <Text className={block('progress-number')} color="primary" variant="display-1">
                        {format.Number(total)}
                    </Text>
                </div>
                <ProgressCircle
                    size={52}
                    gap={1.5}
                    stack={[
                        {value: online, color: 'var(--success-color)'},
                        {value: offline, color: 'var(--danger-color)'},
                        {value: banned, color: 'var(--warning-color)'},
                    ]}
                />
            </div>
            <States
                states={effectiveStates}
                showAlerts={showAlerts}
                showDecomissioned={showDecomissioned}
            />
        </Link>
    );
}

function States({
    states,
    showAlerts,
    showDecomissioned,
}: {
    states: RoleGroupInfo['effectiveStates'];
    showAlerts?: boolean;
    showDecomissioned?: boolean;
}) {
    const {online, offline, banned, alert, dec} = states;
    return (
        <div className={block('counters')}>
            <Status status="online" count={online} />
            <Status status="offline" count={offline} />
            <Status status="banned" count={banned} />
            {showAlerts && <Status status="alert" count={alert} />}
            {showDecomissioned && <Status status="dec" count={dec} />}
        </div>
    );
}

function Status({status, count}: {status: keyof RoleGroupInfo['effectiveStates']; count: number}) {
    return (
        <div className={block('status')}>
            <Text className={block('status-label')} color="secondary" variant="caption-2">
                {status}
            </Text>
            <div className={block('status-count')}>
                <div className={block('status-color', {theme: status})} />
                <Text className={block('status-count-number')} color="primary" variant="caption-2">
                    {format.Number(count)}
                </Text>
            </div>
        </div>
    );
}
