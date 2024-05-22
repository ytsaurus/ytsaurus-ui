import React from 'react';

import {Progress} from '@gravity-ui/uikit';
import MetaTable from '../../../../../components/MetaTable/MetaTable';

import type {Node} from '../../../../../store/reducers/components/nodes/nodes/node';
import {progressText} from '../../../../../utils/progress';

interface NodeResourcesProps {
    removalSlots: Node['removalSlots'];
    repairSlots: Node['repairSlots'];
    replicationSlots: Node['replicationSlots'];
    sealSlots: Node['sealSlots'];
    userSlots: Node['userSlots'];
}

export const hasResourcesMeta = (node: NodeResourcesProps) =>
    [
        node.userSlots.usage,
        node.sealSlots.usage,
        node.repairSlots.usage,
        node.removalSlots.usage,
        node.replicationSlots.usage,
    ].some((item) => typeof item !== 'undefined');

function NodeResources(node: NodeResourcesProps): ReturnType<React.VFC> {
    const userSlots = progressText(node.userSlots.usage, node.userSlots.limits);
    const sealSlots = progressText(node.sealSlots.usage, node.sealSlots.limits);
    const repairSlots = progressText(node.repairSlots.usage, node.repairSlots.limits);
    const removalSlots = progressText(node.removalSlots.usage, node.removalSlots.limits);
    const replicationSLots = progressText(
        node.replicationSlots.usage,
        node.replicationSlots.limits,
    );

    return (
        <MetaTable
            items={[
                {
                    key: 'user slots',
                    value: (
                        <Progress value={node.userSlots.usage} text={userSlots} theme="success" />
                    ),
                },
                {
                    key: 'seal slots',
                    value: (
                        <Progress value={node.sealSlots.usage} text={sealSlots} theme="success" />
                    ),
                },
                {
                    key: 'repair slots',
                    value: (
                        <Progress
                            value={node.repairSlots.usage}
                            text={repairSlots}
                            theme="success"
                        />
                    ),
                },
                {
                    key: 'removal slots',
                    value: (
                        <Progress
                            value={node.removalSlots.usage}
                            text={removalSlots}
                            theme="success"
                        />
                    ),
                },
                {
                    key: 'replication slots',
                    value: (
                        <Progress
                            value={node.replicationSlots.usage}
                            text={replicationSLots}
                            theme="success"
                        />
                    ),
                },
            ]}
        />
    );
}

export default React.memo(NodeResources);
