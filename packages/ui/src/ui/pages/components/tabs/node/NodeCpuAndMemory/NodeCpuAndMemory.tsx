import React from 'react';

import {Progress} from '@gravity-ui/uikit';
import {MetaTable} from '@ytsaurus/components';

import {type Node} from '../../../../../store/reducers/components/nodes/nodes/node';
import MemoryProgress from '../../nodes/MemoryProgress/MemoryProgress';
import i18n from './i18n';

interface NodeCpuAndMemoryProps {
    cpuProgress: Node['cpuProgress'];
    cpuText: Node['cpuText'];
    memoryData?: Node['memoryData'];
    memoryProgress: Node['memoryProgress'];
    memoryText: Node['memoryText'];
    networkProgress: Node['networkProgress'];
    networkText: Node['networkText'];
    gpu?: Node['gpu'];
    flavors?: Node['flavors'];
}

export const hasCpuAndMemoryMeta = (node: NodeCpuAndMemoryProps) =>
    node.cpuProgress || node.memoryProgress || node.networkProgress;

function NodeCpuAndMemory({node}: {node: NodeCpuAndMemoryProps}): ReturnType<React.VFC> {
    const {memoryData, memoryText, cpuProgress, cpuText, networkProgress, networkText, gpu} = node;

    const isExecNode = React.useMemo(() => {
        return Boolean(node.flavors?.includes('exec'));
    }, [node.flavors]);

    return (
        <MetaTable
            items={[
                {
                    key: 'cpu',
                    label: i18n('field_cpu'),
                    value: <Progress value={cpuProgress || 0} text={cpuText} theme="success" />,
                    visible: isExecNode,
                },
                {
                    key: 'memory',
                    label: i18n('field_memory'),
                    value: <MemoryProgress memoryData={memoryData} memoryText={memoryText} />,
                },
                {
                    key: 'gpu',
                    label: i18n('field_gpu'),
                    value: (
                        <Progress
                            value={gpu?.progress || 0}
                            text={gpu?.progressText}
                            theme="success"
                        />
                    ),
                    visible: isExecNode && gpu !== undefined,
                },
                {
                    key: 'network',
                    label: i18n('field_network'),
                    value: (
                        <Progress value={networkProgress || 0} text={networkText} theme="success" />
                    ),
                    visible: isExecNode,
                },
            ]}
        />
    );
}

export default React.memo(NodeCpuAndMemory);
