import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import hammer from '../../../../../common/hammer';
import Label from '../../../../../components/Label/Label';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import {renderLabel} from '../../../../../components/templates/components/nodes/nodes';
import type {Node} from '../../../../../store/reducers/components/nodes/nodes/node';
import {getCurrentClusterConfig} from '../../../../../store/selectors/global';
import UIFactory from '../../../../../UIFactory';

import './NodeMeta.scss';

const block = cn('node-meta');

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

interface Props {
    state: Node['state'];
    tags: Node['tags'];
    userTags: Node['userTags'];
    rack: Node['rack'];
    banned: Node['banned'];
    banMessage?: Node['banMessage'];
    decommissioned: Node['decommissioned'];
    decommissionedMessage?: Node['decommissionedMessage'];
    full: Node['full'];
    alertCount?: Node['alertCount'];
    dataCenter: Node['dataCenter'];
    lastSeenTime: Node['lastSeenTime'];
    disableJobs: Node['disableJobs'];
    disableTabletCells: Node['disableTabletCells'];
    disableWriteSession: Node['disableWriteSession'];
    physicalHost: Node['physicalHost'];
    host: Node['host'];
}

function NodeMeta({
    state,
    tags,
    userTags,
    rack,
    banned,
    banMessage = '',
    decommissioned,
    decommissionedMessage,
    full,
    alertCount,
    dataCenter,
    lastSeenTime,
    disableJobs,
    disableTabletCells,
    disableWriteSession,
    physicalHost,
    host,
}: Props): ReturnType<React.VFC> {
    const clusterConfig = useSelector(getCurrentClusterConfig);
    const stateText = hammer.format['FirstUppercase'](state);
    const stateTheme = getStateTheme(state);

    const metaTableItems = React.useMemo(
        () => [
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
                value: <Label text={banMessage} theme="warning" type="text" />,
                visible: Boolean(banned),
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
        ],
        [
            alertCount,
            banMessage,
            banned,
            dataCenter,
            decommissioned,
            disableJobs,
            disableTabletCells,
            disableWriteSession,
            full,
            lastSeenTime,
            rack,
            stateText,
            stateTheme,
        ],
    );

    const tagsItems = React.useMemo(
        () => [
            {
                key: 'tags',
                value: <Tags items={tags} />,
                visible: Boolean(tags?.length),
            },
            {
                key: 'user_tags',
                value: <Tags items={userTags} />,
                visible: Boolean(userTags?.length),
            },
        ],
        [tags, userTags],
    );

    const urlItems = React.useMemo(() => {
        return UIFactory.getExtraMetaTableItemsForComponentsNode({
            host,
            physicalHost,
            clusterConfig,
        });
    }, [host, physicalHost, clusterConfig]);

    return (
        <div className={block()}>
            <MetaTable
                className={block('column', {type: 'meta'})}
                items={_.compact([metaTableItems, tagsItems, urlItems])}
            />
        </div>
    );
}

function Tags({items}: {items?: Array<string>}) {
    return (
        <div className={block('tags')}>
            {_.map(items, (tag) => (
                <Label key={tag} text={tag} />
            ))}
        </div>
    );
}

export default React.memo(NodeMeta);
