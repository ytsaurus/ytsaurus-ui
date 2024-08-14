import {Flex, Link, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {useEffect, useState} from 'react';

import {Cube} from '@gravity-ui/icons';

import format from '../../../common/hammer/format';
import {ExpandButton} from '../../../components/ExpandButton';
import {GridWithMediaMinWidth} from '../../../containers/GridWithMediaMinWidth/GridWithMediaMinWidth';

import type {RoleGroupInfo} from '../../../store/reducers/system/proxies';
import NodeQuad from '../NodeQuad/NodeQuad';
import {StatsInfo} from './StatsInfo';

import './RoleGroup.scss';

const block = cn('yt-role-group');

export type MakeUrlParams = {
    name?: string;
    state?: 'online' | 'offline' | 'banned' | 'others';
    flag?: 'decommissioned' | 'alerts' | 'full';
};

export function RoleGroupsContainer({children}: {children: React.ReactNode}) {
    return (
        <GridWithMediaMinWidth
            className={block('groups-container')}
            gap={16}
            itemClassName={block()}
            itemMinWidth={590}
            itemMaxWidth={1100}
        >
            {children}
        </GridWithMediaMinWidth>
    );
}

type Props = {
    data: RoleGroupInfo;
    makeUrl: (params?: MakeUrlParams) => string;
    showFlags?: boolean;
    hideOthers?: boolean;
    bannedAsState?: boolean;
    forceExpand?: boolean;
};

export function RoleGroup({data, makeUrl, forceExpand}: Props) {
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
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (forceExpand !== undefined) {
            setExpanded(forceExpand);
        }
    }, [forceExpand]);

    const onToggle = () => {
        setExpanded(!expanded);
    };

    const nameUrl = makeUrl({name});

    return (
        <div className={block()}>
            <Flex alignItems="center">
                <div className={block('progress-text')}>
                    <Flex justifyContent={'space-between'}>
                        <Link
                            view="primary"
                            href={nameUrl}
                            className={block('name')}
                            target="_blank"
                        >
                            <Text variant="body-2" className={block('name-name')}>
                                {name}
                            </Text>
                        </Link>
                        {data?.items?.length > 0 && (
                            <ExpandButton
                                className={block('expand-btn')}
                                toggleExpanded={onToggle}
                                expanded={expanded}
                            />
                        )}
                    </Flex>
                    <Flex direction={'column'} className={block('bottom-info')}>
                        <Flex alignItems={'center'} gap={2}>
                            <Cube className={block('cube-icon')} />
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
                        <span>TOTAL IN RACK</span>
                    </Flex>
                </div>
                <div className={block('divider')} />
                <Flex alignItems="center" gap="9" grow="2" style={{height: '100%'}}>
                    <StatsInfo
                        status={'ONLINE'}
                        count={online}
                        url={makeUrl({name, state: 'online'})}
                        alertCount={alerts_online}
                        alertsUrl={makeUrl({name, state: 'online', flag: 'alerts'})}
                        decCount={dec_online}
                        decUrl={makeUrl({name, state: 'online', flag: 'decommissioned'})}
                    />
                    <StatsInfo
                        status={'OFFLINE'}
                        count={offline}
                        url={makeUrl({name, state: 'offline'})}
                        alertCount={alerts_offline}
                        alertsUrl={makeUrl({name, state: 'offline', flag: 'alerts'})}
                        decCount={dec_offline}
                        decUrl={makeUrl({name, state: 'offline', flag: 'decommissioned'})}
                    />
                    <StatsInfo
                        status={'BANNED'}
                        count={banned}
                        url={makeUrl({name, state: 'banned'})}
                        alertCount={alerts_banned}
                        alertsUrl={makeUrl({name, state: 'banned', flag: 'alerts'})}
                        decCount={dec_banned}
                        decUrl={makeUrl({name, state: 'banned', flag: 'decommissioned'})}
                    />
                    {other > 0 && (
                        <StatsInfo
                            count={other}
                            status={'OTHER'}
                            url={makeUrl({name, state: 'others'})}
                        />
                    )}
                    {full > 0 && (
                        <StatsInfo
                            count={full}
                            status={'FULL'}
                            url={makeUrl({name, flag: 'full'})}
                        />
                    )}
                </Flex>
            </Flex>
            {expanded && (
                <div className={block('rack-nodes')}>
                    {items.map(({effectiveState, alerts, decommissioned, name, banned, full}) => {
                        return (
                            <NodeQuad
                                key={name}
                                theme={effectiveState}
                                alerts={alerts}
                                banned={banned}
                                decommissioned={decommissioned}
                                full={full}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
