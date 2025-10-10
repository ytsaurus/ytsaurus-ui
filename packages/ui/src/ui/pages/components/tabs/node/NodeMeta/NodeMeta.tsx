import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import compact_ from 'lodash/compact';
import map_ from 'lodash/map';

import Label from '../../../../../components/Label/Label';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import type {Node} from '../../../../../store/reducers/components/nodes/nodes/node';
import {getCurrentClusterConfig} from '../../../../../store/selectors/global';
import UIFactory from '../../../../../UIFactory';
import {getNodeMetaItems} from '../../../../../utils/components/nodes/node-meta-items';

import './NodeMeta.scss';

const block = cn('node-meta');

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
    maintenanceRequests?: Node['maintenanceRequests'];
    version?: Node['version'];
    jobProxyBuildVersion?: Node['jobProxyBuildVersion'];
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
    jobProxyBuildVersion,
    physicalHost,
    host,
    maintenanceRequests,
    version,
}: Props): ReturnType<React.VFC> {
    const clusterConfig = useSelector(getCurrentClusterConfig);

    const metaTableItems = React.useMemo(() => {
        return getNodeMetaItems({
            alertCount,
            banMessage,
            banned,
            dataCenter,
            decommissioned,
            decommissionedMessage,
            disableJobs,
            disableTabletCells,
            disableWriteSession,
            full,
            jobProxyBuildVersion,
            lastSeenTime,
            rack,
            state,
            maintenanceRequests,
            version,
        });
    }, [
        alertCount,
        banMessage,
        banned,
        dataCenter,
        decommissioned,
        decommissionedMessage,
        disableJobs,
        disableTabletCells,
        disableWriteSession,
        full,
        jobProxyBuildVersion,
        lastSeenTime,
        rack,
        state,
        maintenanceRequests,
        version,
    ]);

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
                items={compact_([metaTableItems, tagsItems, urlItems])}
            />
        </div>
    );
}

function Tags({items}: {items?: Array<string>}) {
    return (
        <div className={block('tags')}>
            {map_(items, (tag) => (
                <Label key={tag} text={tag} />
            ))}
        </div>
    );
}

export default React.memo(NodeMeta);
