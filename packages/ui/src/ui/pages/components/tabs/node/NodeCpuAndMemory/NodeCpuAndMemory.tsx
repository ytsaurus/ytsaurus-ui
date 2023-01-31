import React from 'react';

import {Progress} from '@gravity-ui/uikit';
import MetaTable from '../../../../../components/MetaTable/MetaTable';

import type {Node} from '../../../../../store/reducers/components/nodes/nodes/node';
import MemoryProgress from '../../nodes/MemoryProgress/MemoryProgress';

interface NodeCpuAndMemoryProps {
    cpuProgress: Node['cpuProgress'];
    cpuText: Node['cpuText'];
    memoryData?: Node['memoryData'];
    memoryProgress: Node['memoryProgress'];
    memoryText: Node['memoryText'];
    networkProgress: Node['networkProgress'];
    networkText: Node['networkText'];
}

export const hasCpuAndMemoryMeta = (node: NodeCpuAndMemoryProps) =>
    node.cpuProgress || node.memoryProgress || node.networkProgress;

function NodeCpuAndMemory({node}: {node: NodeCpuAndMemoryProps}): ReturnType<React.VFC> {
    const {
        memoryData,
        memoryText,
        memoryProgress,
        cpuProgress,
        cpuText,
        networkProgress,
        networkText,
    } = node;
    return (
        <MetaTable
            items={[
                {
                    key: 'cpu',
                    value: <Progress value={cpuProgress} text={cpuText} theme="success" />,
                },
                {
                    key: 'memory',
                    value: (
                        <MemoryProgress
                            memoryData={memoryData}
                            memoryText={memoryText}
                            memoryProgress={memoryProgress || 0}
                        />
                    ),
                },
                {
                    key: 'network',
                    value: <Progress value={networkProgress} text={networkText} theme="success" />,
                },
            ]}
        />
    );
}

export default React.memo(NodeCpuAndMemory);
