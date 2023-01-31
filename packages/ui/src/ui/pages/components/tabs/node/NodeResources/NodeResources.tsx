import React from 'react';

import {Progress} from '@gravity-ui/uikit';
import MetaTable from '../../../../../components/MetaTable/MetaTable';

import {prepareUsageText} from '../../../../../components/templates/components/nodes/nodes';
import type {Node} from '../../../../../store/reducers/components/nodes/nodes/node';

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
    const userSlots = prepareUsageText(node.userSlots.usage, node.userSlots.limits, 'Number');
    const sealSlots = prepareUsageText(node.sealSlots.usage, node.sealSlots.limits, 'Number');
    const repairSlots = prepareUsageText(node.repairSlots.usage, node.repairSlots.limits, 'Number');
    const removalSlots = prepareUsageText(
        node.removalSlots.usage,
        node.removalSlots.limits,
        'Number',
    );
    const replicationSLots = prepareUsageText(
        node.replicationSlots.usage,
        node.replicationSlots.limits,
        'Number',
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
