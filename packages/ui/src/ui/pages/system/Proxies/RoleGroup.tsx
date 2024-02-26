import {Button, Flex, Icon, Link, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {useEffect, useState} from 'react';

import './RoleGroup.scss';

import format from '../../../common/hammer/format';

import {ChevronRight, Cube} from '@gravity-ui/icons';
import type {RoleGroupInfo} from '../../../store/reducers/system/proxies';
import NodeQuad from '../NodeQuad/NodeQuad';
import {AnimatedCollapse} from './AnimatedCollapse';
import {StatsInfo} from './StatsInfo';

const block = cn('yt-role-group');

export type MakeUrlParams = {
    name?: string;
    state?: 'online' | 'offline' | 'banned' | 'others';
    flag?: 'decommissioned' | 'alerts' | 'full';
};

export function RoleGroupsContainer({children}: {children: React.ReactNode}) {
    return <div className={block('role-groups-container')}>{children}</div>;
}

type Props = {
    data: RoleGroupInfo;
    makeUrl: (params?: MakeUrlParams) => string | undefined;
    showFlags?: boolean;
    hideOthers?: boolean;
    bannedAsState?: boolean;
    forceCollapse?: boolean;
};

export function RoleGroup({data, makeUrl, forceCollapse}: Props) {
    const {name, counters, items} = data;
    const {online = 0, offline = 0, other = 0} = counters.effectiveStates;
    const {
        banned = 0,
        full = 0,
        alerts_online = 0,
        alerts_offline = 0,
        alerts_banned = 0,
        dec_offline = 0,
        dec_online = 0,
        dec_banned = 0,
    } = counters.flags;
    const [collapsed, setCollapsed] = useState(true);

    useEffect(() => {
        if (forceCollapse !== undefined) {
            setCollapsed(forceCollapse);
        }
    }, [forceCollapse]);

    const onToggle = () => {
        setCollapsed((prev) => !prev);
    };

    const nameUrl = makeUrl({name});

    const calculateStack = (count: number, alerts: number, dec: number, colors: string[]) => {
        if (count === 0) return [];

        const alertsValue = (alerts / count) * 100;
        const decValue = (dec / count) * 100;
        const remaining = 100 - alertsValue - decValue;

        console.log(name, alertsValue, decValue, remaining);

        return [
            {
                value: remaining,
                color: colors[0],
            },
            {
                value: alertsValue,
                color: colors[1],
            },
            {
                value: decValue,
                color: colors[2],
            },
        ];
    };

    return (
        <div className={block()}>
            <Flex
                alignItems="center"
                style={{width: '100%', height: '92.05px'}}
                justifyContent="space-between"
            >
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
                        <Flex direction={'column'} gap={2} className={block('bottom-info')}>
                            <Flex alignItems={'center'} gap={2}>
                                <Cube />
                                <Link
                                    view="primary"
                                    className={block('progress-number')}
                                    href={nameUrl}
                                    target="_blank"
                                >
                                    <Text variant="body-2" style={{fontWeight: '600'}}>
                                        {format.Number(counters.total)}
                                    </Text>
                                </Link>
                            </Flex>
                            <span>total in rack</span>
                        </Flex>
                    </div>
                </div>
                <Flex alignItems="center" gap={9} style={{height: '100%'}}>
                    <Flex alignItems="center" gap="9" style={{height: '100%'}}>
                        <StatsInfo
                            total={counters.total}
                            count={online}
                            stack={calculateStack(online, alerts_online, dec_online, [
                                'var(--success-color)',
                                'var(--success-text)',
                                '#5A7732',
                            ])}
                            status={'online'}
                            theme="success"
                            alertNumber={alerts_online}
                            decNumber={dec_online}
                            url={makeUrl({name, state: 'online'})}
                            alertsUrl={makeUrl({name, flag: 'alerts'})}
                            decUrl={makeUrl({name, flag: 'decommissioned'})}
                        />
                        <StatsInfo
                            total={counters.total}
                            count={offline}
                            stack={calculateStack(offline, alerts_offline, dec_offline, [
                                'var(--danger-color)',
                                'var(--danger-text)',
                                '#A23125',
                            ])}
                            status={'offline'}
                            theme="danger"
                            alertNumber={alerts_offline}
                            decNumber={dec_offline}
                            url={makeUrl({name, state: 'offline'})}
                            alertsUrl={makeUrl({name, flag: 'alerts'})}
                            decUrl={makeUrl({name, flag: 'decommissioned'})}
                        />
                        <StatsInfo
                            total={counters.total}
                            count={banned}
                            stack={calculateStack(banned, alerts_banned, dec_banned, [
                                'var(--warning-color)',
                                'var(--warning-text)',
                                '#BA7512',
                            ])}
                            status={'banned'}
                            theme="warning"
                            alertNumber={alerts_banned}
                            decNumber={dec_banned}
                            url={makeUrl({name, state: 'banned'})}
                            alertsUrl={makeUrl({name, flag: 'alerts'})}
                            decUrl={makeUrl({name, flag: 'decommissioned'})}
                        />
                        <div className="divider" />
                        <StatsInfo
                            total={counters.total}
                            count={other}
                            theme="success"
                            status={'other'}
                            url={makeUrl({name, state: 'others'})}
                        />
                        <StatsInfo
                            stack={[]}
                            theme="info"
                            total={counters.total}
                            count={full}
                            status={'full'}
                            url={makeUrl({name, flag: 'full'})}
                        />
                    </Flex>
                    {data.items && data.items.length !== 0 && (
                        <Button
                            size="l"
                            view="flat"
                            onClick={onToggle}
                            className={block('collapse-button', {
                                collapsed,
                            })}
                        >
                            <Icon data={ChevronRight} size={18} />
                        </Button>
                    )}
                </Flex>
            </Flex>
            <AnimatedCollapse collapsed={collapsed}>
                <div className={block('rack-nodes')}>
                    {items.map(({effectiveState, alerts, decommissioned, name, banned}) => {
                        const text = alerts ? 'A' : decommissioned ? 'D' : '';
                        const state: any = `${banned ? 'banned' : effectiveState}${
                            text.length !== 0 ? '-letter' : ''
                        }`;

                        return (
                            <NodeQuad key={name} theme={state}>
                                {text}
                            </NodeQuad>
                        );
                    })}
                </div>
            </AnimatedCollapse>
        </div>
    );
}

// function States({
//     counters,
//     showFlags,
//     hideOthers,
//     makeUrl,
//     bannedAsState,
// }: {
//     counters: SystemNodeCounters;
//     showFlags?: boolean;
//     hideOthers?: boolean;
//     makeUrl: (params?: MakeUrlParams) => string | undefined;
//     bannedAsState?: boolean;
// }) {
//     const {online = 0, offline = 0, other = 0} = counters.effectiveStates;
//     const {decommissioned = 0, alerts = 0, banned = 0, full = 0} = counters.flags;

//     let k = -1;
//     const statesRow = [
//         <Status key={++k} status="online" count={online} url={makeUrl({state: 'online'})} />,
//         <span key={++k} />,
//         <Status key={++k} status="offline" count={offline} url={makeUrl({state: 'offline'})} />,
//         <span key={++k} />,
//         ...(bannedAsState
//             ? [
//                   <Status
//                       key={++k}
//                       status="alert"
//                       label="banned"
//                       count={banned}
//                       url={makeUrl({state: 'banned'})}
//                   />,
//                   <span key={++k} />,
//               ]
//             : []),
//         ...(hideOthers
//             ? []
//             : [
//                   <Status
//                       key={++k}
//                       status="other"
//                       count={other}
//                       url={makeUrl({state: 'others'})}
//                   />,
//                   <span key={++k} />,
//               ]),
//         <span key={++k} />,
//         <span key={++k} />,
//         <span key={++k} />,
//     ].filter(Boolean);

//     const flagsRow = !showFlags
//         ? []
//         : [
//               <Status key={++k} status="alert" count={alerts} url={makeUrl({flag: 'alerts'})} />,
//               <span key={++k} />,
//               ...(bannedAsState
//                   ? []
//                   : [
//                         <React.Fragment key={++k}>
//                             <Status
//                                 key={++k}
//                                 status="banned"
//                                 count={banned}
//                                 url={makeUrl({state: 'banned'})}
//                             />
//                             <span />
//                         </React.Fragment>,
//                     ]),
//               <Status
//                   key={++k}
//                   status="dec"
//                   count={decommissioned}
//                   url={makeUrl({flag: 'decommissioned'})}
//               />,
//               <span key={++k} />,
//               <Status key={++k} status="full" count={full} url={makeUrl({flag: 'full'})} />,
//               <span key={++k} />,
//           ];

//     return (
//         <div className={block('counters')}>
//             {statesRow.slice(0, 7)}
//             {flagsRow.slice(0, 7)}
//         </div>
//     );
// }

// function Status({
//     status,
//     label,
//     count,
//     url,
// }: {
//     status: NodeEffectiveState | 'banned' | 'alert' | 'dec' | 'full';
//     label?: string;
//     count: number;
//     url?: string;
// }) {
//     const withUrl = count > 0 && Boolean(url);
//     const content = (
//         <React.Fragment>
//             <Text
//                 className={block('status-label')}
//                 color={withUrl ? undefined : 'secondary'}
//                 variant="caption-2"
//             >
//                 {label ?? status}
//             </Text>
//             <div className={block('status-count')}>
//                 <div className={block('status-color', {theme: status, empty: !(count > 0)})} />
//                 <Text className={block('status-count-number')} color="primary" variant="caption-2">
//                     {format.Number(count)}
//                 </Text>
//             </div>
//         </React.Fragment>
//     );
//     return withUrl ? (
//         <Link className={block('status')} view="secondary" href={url} target="_blank">
//             {content}
//         </Link>
//     ) : (
//         <div className={block('status')}>{content}</div>
//     );
// }
