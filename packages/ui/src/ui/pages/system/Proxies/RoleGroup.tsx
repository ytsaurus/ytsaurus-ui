import React from 'react';
import cn from 'bem-cn-lite';
import {Link, Text} from '@gravity-ui/uikit';

import './RoleGroup.scss';

import format from '../../../common/hammer/format';
import {ProgressCircle} from '../../../components/ProgressCircle/ProgressCircle';

import type {RoleGroupInfo, SystemNodeCounters} from '../../../store/reducers/system/proxies';
import type {NodeEffectiveState} from '../../../store/reducers/system/nodes';

const block = cn('yt-role-group');

export type MakeUrlParams = {
    name?: string;
    state?: 'online' | 'offline' | 'banned' | 'others';
    flag?: 'decommissioned' | 'alerts' | 'full';
};

export function RoleGroupsContainer({children}: {children: React.ReactNode}) {
    return <div className={block('container')}>{children}</div>;
}

export function RoleGroup({
    data: {name, counters},
    makeUrl,
    hideOthers,
    showFlags,
    bannedAsState,
}: {
    data: RoleGroupInfo;
    makeUrl: (params?: MakeUrlParams) => string | undefined;
    showFlags?: boolean;
    hideOthers?: boolean;
    bannedAsState?: boolean;
}) {
    const {online = 0, offline = 0, other = 0} = counters.effectiveStates;
    const nameUrl = makeUrl({name});
    return (
        <div className={block()}>
            <div className={block('progress')}>
                <div className={block('progress-text')}>
                    <div>
                        <Link
                            view="primary"
                            href={nameUrl}
                            className={block('name')}
                            target="_blank"
                        >
                            <Text variant="body-3" ellipsis>
                                {name}
                            </Text>
                        </Link>
                    </div>
                    <Link
                        view="primary"
                        className={block('progress-number')}
                        href={nameUrl}
                        target="_blank"
                    >
                        <Text variant="display-1">{format.Number(counters.total)}</Text>
                    </Link>
                </div>
                <ProgressCircle
                    size={52}
                    gap={1.5}
                    stack={[
                        {value: online, color: 'var(--success-color)'},
                        {value: offline, color: 'var(--danger-color)'},
                        {value: other, color: 'var(--info-color)'},
                    ]}
                />
            </div>
            <States
                bannedAsState={bannedAsState}
                counters={counters}
                showFlags={showFlags}
                hideOthers={hideOthers}
                makeUrl={(params) => makeUrl({name, ...params})}
            />
        </div>
    );
}

function States({
    counters,
    showFlags,
    hideOthers,
    makeUrl,
    bannedAsState,
}: {
    counters: SystemNodeCounters;
    showFlags?: boolean;
    hideOthers?: boolean;
    makeUrl: (params?: MakeUrlParams) => string | undefined;
    bannedAsState?: boolean;
}) {
    const {online = 0, offline = 0, other = 0} = counters.effectiveStates;
    const {decommissioned = 0, alerts = 0, banned = 0, full = 0} = counters.flags;

    let k = -1;
    const statesRow = [
        <Status key={++k} status="online" count={online} url={makeUrl({state: 'online'})} />,
        <span key={++k} />,
        <Status key={++k} status="offline" count={offline} url={makeUrl({state: 'offline'})} />,
        <span key={++k} />,
        ...(bannedAsState
            ? [
                  <Status
                      key={++k}
                      status="alert"
                      label="banned"
                      count={banned}
                      url={makeUrl({state: 'banned'})}
                  />,
                  <span key={++k} />,
              ]
            : []),
        ...(hideOthers
            ? []
            : [
                  <Status
                      key={++k}
                      status="other"
                      count={other}
                      url={makeUrl({state: 'others'})}
                  />,
                  <span key={++k} />,
              ]),
        <span key={++k} />,
        <span key={++k} />,
        <span key={++k} />,
    ].filter(Boolean);

    const flagsRow = !showFlags
        ? []
        : [
              <Status key={++k} status="alert" count={alerts} url={makeUrl({flag: 'alerts'})} />,
              <span key={++k} />,
              ...(bannedAsState
                  ? []
                  : [
                        <React.Fragment key={++k}>
                            <Status
                                key={++k}
                                status="banned"
                                count={banned}
                                url={makeUrl({state: 'banned'})}
                            />
                            <span />
                        </React.Fragment>,
                    ]),
              <Status
                  key={++k}
                  status="dec"
                  count={decommissioned}
                  url={makeUrl({flag: 'decommissioned'})}
              />,
              <span key={++k} />,
              <Status key={++k} status="full" count={full} url={makeUrl({flag: 'full'})} />,
              <span key={++k} />,
          ];

    return (
        <div className={block('counters')}>
            {statesRow.slice(0, 7)}
            {flagsRow.slice(0, 7)}
        </div>
    );
}

function Status({
    status,
    label,
    count,
    url,
}: {
    status: NodeEffectiveState | 'banned' | 'alert' | 'dec' | 'full';
    label?: string;
    count: number;
    url?: string;
}) {
    const withUrl = count > 0 && Boolean(url);
    const content = (
        <React.Fragment>
            <Text
                className={block('status-label')}
                color={withUrl ? undefined : 'secondary'}
                variant="caption-2"
            >
                {label ?? status}
            </Text>
            <div className={block('status-count')}>
                <div className={block('status-color', {theme: status, empty: !(count > 0)})} />
                <Text className={block('status-count-number')} color="primary" variant="caption-2">
                    {format.Number(count)}
                </Text>
            </div>
        </React.Fragment>
    );
    return withUrl ? (
        <Link className={block('status')} view="secondary" href={url} target="_blank">
            {content}
        </Link>
    ) : (
        <div className={block('status')}>{content}</div>
    );
}
