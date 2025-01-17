import React from 'react';

import {Progress} from '@gravity-ui/uikit';
import MetaTable from '../../../../../components/MetaTable/MetaTable';

import type {Node} from '../../../../../store/reducers/components/nodes/nodes/node';
import {calcProgressProps} from '../../../../../utils/utils';

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
    return (
        <MetaTable
            items={[
                {
                    key: 'user slots',
                    value: (
                        <Progress
                            {...calcProgressProps(node.userSlots.usage, node.userSlots.limits)}
                            theme="success"
                        />
                    ),
                },
                {
                    key: 'seal slots',
                    value: (
                        <Progress
                            {...calcProgressProps(node.sealSlots.usage, node.sealSlots.limits)}
                            theme="success"
                        />
                    ),
                },
                {
                    key: 'repair slots',
                    value: (
                        <Progress
                            {...calcProgressProps(node.repairSlots.usage, node.repairSlots.limits)}
                            theme="success"
                        />
                    ),
                },
                {
                    key: 'removal slots',
                    value: (
                        <Progress
                            {...calcProgressProps(
                                node.removalSlots.usage,
                                node.removalSlots.limits,
                            )}
                            theme="success"
                        />
                    ),
                },
                {
                    key: 'replication slots',
                    value: (
                        <Progress
                            {...calcProgressProps(
                                node.replicationSlots.usage,
                                node.replicationSlots.limits,
                            )}
                            theme="success"
                        />
                    ),
                },
            ]}
        />
    );
}

export default React.memo(NodeResources);
