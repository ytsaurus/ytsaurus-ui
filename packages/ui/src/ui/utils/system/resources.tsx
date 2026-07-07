import forEach_ from 'lodash/forEach';

import hammer from '../../common/hammer';
import {type TooltipInfoItem, calculateDiskSpaceProgress} from '../diskSpaceProgress';
import {type Stack} from '@gravity-ui/uikit';

const formatNumber = hammer.format.Number;
const formatBytes = hammer.format.Bytes;

export interface ResourceUsage {
    text: string;
    progress?: number;
    stack?: Array<Stack>;
    tooltipInfo?: Array<TooltipInfoItem>;
}

export interface ResourceEntry {
    caption: string;
    show?: boolean;
    usage: ResourceUsage;
}

export interface ResourcesData {
    resource_usage?: {
        cpu?: number;
        user_memory?: number;
        gpu?: number;
    };
    resource_limits?: {
        cpu?: number;
        user_memory?: number;
        gpu?: number;
    };
}

export interface NodeAttributes {
    available_space_per_medium?: Record<string, number>;
    used_space_per_medium?: Record<string, number>;
    full_node_count?: number;
    online_node_count?: number;
}

export function prepareResources(resources: ResourcesData | null | undefined): ResourceEntry[] {
    if (!resources) {
        return [];
    }
    const {resource_usage: usage, resource_limits: limits} = resources;
    return [
        {
            caption: 'CPU',
            usage: {
                text: formatNumber(usage?.cpu) + ' / ' + formatNumber(limits?.cpu),
                progress: limits?.cpu && usage?.cpu ? (usage.cpu / limits.cpu) * 100 : 0,
            },
        },
        {
            caption: 'Memory',
            usage: {
                text: formatBytes(usage?.user_memory) + ' / ' + formatBytes(limits?.user_memory),
                progress:
                    limits?.user_memory && usage?.user_memory
                        ? (usage.user_memory / limits.user_memory) * 100
                        : 0,
            },
        },
        {
            caption: 'GPU',
            usage: {
                text: formatNumber(usage?.gpu) + ' / ' + formatNumber(limits?.gpu),
                progress: limits?.gpu && usage?.gpu ? (usage.gpu / limits.gpu) * 100 : 0,
            },
        },
    ];
}

export function prepareDiskResources(params: {
    nodeAttributes?: NodeAttributes;
    mediumList?: string[];
    systemReservedDiskSpacePerMedium?: Record<string, number>;
    uncommittedDiskSpacePerMedium?: Record<string, number>;
}): ResourceEntry[] {
    const {
        nodeAttributes,
        mediumList,
        systemReservedDiskSpacePerMedium,
        uncommittedDiskSpacePerMedium,
    } = params;
    const diskResourcesPerMedium: ResourceEntry[] = [];

    if (nodeAttributes && mediumList) {
        const {
            available_space_per_medium: availableSpacePerMedium,
            used_space_per_medium: usedSpacePerMedium,
        } = nodeAttributes;

        forEach_(mediumList, (medium) => {
            const available = availableSpacePerMedium?.[medium] ?? 0;
            const used = usedSpacePerMedium?.[medium] ?? 0;

            if (available > 0 || used > 0) {
                const total = available + used;
                const caption = hammer.format['ReadableField'](medium);
                const systemReserved = systemReservedDiskSpacePerMedium?.[medium] ?? 0;
                const uncommitted = uncommittedDiskSpacePerMedium?.[medium] ?? 0;

                const {text, stack, tooltipInfo} = calculateDiskSpaceProgress({
                    used,
                    systemReserved,
                    uncommitted,
                    total,
                });

                diskResourcesPerMedium.push({
                    caption,
                    show: true,
                    usage: {
                        text,
                        stack,
                        tooltipInfo,
                    },
                });
            }
        });
    }
    return diskResourcesPerMedium;
}
