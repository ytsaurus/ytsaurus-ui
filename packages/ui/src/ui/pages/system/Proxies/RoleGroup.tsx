import React from 'react';
import cn from 'bem-cn-lite';
import {Link, Text} from '@gravity-ui/uikit';

import './RoleGroup.scss';

import format from '../../../common/hammer/format';
import {ProgressCircle} from '../../../components/ProgressCircle/ProgressCircle';

import type {RoleGroupInfo, SystemNodeCounters} from '../../../store/reducers/system/proxies';
import type {NodeEffectiveState} from '../../../store/reducers/system/nodes';

const block = cn('yt-role-group');

export function RoleGroupsContainer({children}: {children: React.ReactNode}) {
    return <div className={block('container')}>{children}</div>;
}

export function RoleGroup({
    data: {name, counters},
    url,
    showFlags,
}: {
    data: RoleGroupInfo;
    url: string;
    showFlags?: boolean;
}) {
    const {online = 0, offline = 0, banned = 0, other = 0} = counters.effectiveStates;
    return (
        <Link href={url} className={block()}>
            <div className={block('progress')}>
                <div className={block('progress-text')}>
                    <Text className={block('name')} color="primary" variant="body-3" ellipsis>
                        {name}
                    </Text>
                    <Text className={block('progress-number')} color="primary" variant="display-1">
                        {format.Number(counters.total)}
                    </Text>
                </div>
                <ProgressCircle
                    size={52}
                    gap={1.5}
                    stack={[
                        {value: online, color: 'var(--success-color)'},
                        {value: offline, color: 'var(--danger-color)'},
                        {value: banned, color: 'var(--warning-color)'},
                        {value: other, color: 'var(--info-color)'},
                    ]}
                />
            </div>
            <States counters={counters} showFlags={showFlags} />
        </Link>
    );
}

function States({counters, showFlags}: {counters: SystemNodeCounters; showFlags?: boolean}) {
    const {online = 0, offline = 0, banned = 0, other = 0} = counters.effectiveStates;
    const {decommissioned = 0, alerts = 0, full = 0} = counters.flags;
    return (
        <div className={block('counters')}>
            <Status status="online" count={online} />
            <span />
            <Status status="offline" count={offline} />
            <span />
            <Status status="banned" count={banned} />
            <span />
            <Status status="other" count={other} />
            {showFlags && (
                <>
                    <Status status="alert" count={alerts} />
                    <span />
                    <Status status="dec" count={decommissioned} />
                    <span />
                    <Status status="full" count={full} />
                    <span />
                </>
            )}
        </div>
    );
}

function Status({
    status,
    count,
}: {
    status: NodeEffectiveState | 'alert' | 'dec' | 'full';
    count: number;
}) {
    return (
        <div className={block('status')}>
            <Text className={block('status-label')} color="secondary" variant="caption-2">
                {status}
            </Text>
            <div className={block('status-count')}>
                <div className={block('status-color', {theme: status, empty: !(count > 0)})} />
                <Text className={block('status-count-number')} color="primary" variant="caption-2">
                    {format.Number(count)}
                </Text>
            </div>
        </div>
    );
}
