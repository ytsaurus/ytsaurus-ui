import _ from 'lodash';
import hammer from '../../common/hammer';
import {accountsIoThroughputThresholds} from '../../utils/progress';
import {calcProgressProps} from '../../utils/utils';

const nodesChunksUsageList = ['node_count', 'chunk_count'] as const;

export interface ClusterTotalsUsage {
    total_resource_limits: {
        chunk_count: number;
        disk_space: number;
        disk_space_per_medium: Record<string, number>;
        master_memory: {
            chunk_host: number;
            per_cell: Record<string, number>;
            total: number;
        };
        node_count: number;
        tablet_count: number;
        tablet_static_memory: number;
    };
    total_resource_usage: {
        chunk_count: number;
        chunk_host_cell_master_memory: number;
        detailed_master_memory: {
            attributes: number;
            chunks: number;
            nodes: number;
            schemas: number;
            tablets: number;
        };
        disk_space: number;
        disk_space_per_medium: Record<string, number>;
        master_memory: {
            chunk_host: number;
            per_cell: Record<string, number>;
            total: number;
        };
        node_count: number;
        tablet_count: number;
        tablet_static_memory: number;
    };
}

interface IOStatistics {
    filesystem_read_rate: number;
    filesystem_write_rate: number;
    disk_read_rate: number;
    disk_write_rate: number;
    disk_read_capacity: number;
    disk_write_capacity: number;
}

export interface NodesData {
    available_space_per_medium: Record<string, number>;
    io_statistics_per_medium: Record<string, IOStatistics>;
    used_space_per_medium: Record<string, number>;
}

interface MediumStat {
    usage: number;
    limit: number;
}

function prepareMediumStats<T extends Record<string, MediumStat>>(
    usedSpace: Record<keyof T, number>,
    availableSpace: Record<keyof T, number>,
    settings: T,
) {
    return _.each(settings, (stats, type) => {
        const used = usedSpace[type] || 0;
        const available = availableSpace[type] || 0;
        stats.usage = used;
        stats.limit = available;
    });
}

function initMediumStats<T extends readonly string[]>(list: T) {
    return _.reduce(
        list,
        (list, type: T[number]) => {
            list[type] = {
                usage: 0,
                limit: 0,
            };

            return list;
        },
        {} as Record<T[number], MediumStat>,
    );
}

function getClusterTotal(
    clusterTotalsUsage: ClusterTotalsUsage,
    _nodesData: NodesData,
    mediumList: string[],
) {
    // TODO use hammer.aggregation
    const perMedium = initMediumStats(mediumList);
    let usedSpacePerMedia;
    let availableSpacePerMedia;

    if (clusterTotalsUsage) {
        usedSpacePerMedia = clusterTotalsUsage.total_resource_usage.disk_space_per_medium;
        availableSpacePerMedia = clusterTotalsUsage.total_resource_limits.disk_space_per_medium;
        prepareMediumStats(usedSpacePerMedia, availableSpacePerMedia, perMedium);
    }

    return {
        perMedium: perMedium,
    };
}

function getHardwareLimit(nodesData: NodesData, mediumList: string[]) {
    // TODO use hammer.aggregation
    const perMedium = initMediumStats(mediumList);

    if (nodesData) {
        const usedSpacePerMedia = nodesData.used_space_per_medium || {};
        const availableSpacePerMedia = nodesData.available_space_per_medium || {};

        _.each(mediumList, (mediumType) => {
            const used = usedSpacePerMedia[mediumType] || 0;
            const available = availableSpacePerMedia[mediumType] || 0;

            perMedium[mediumType].usage = used;
            perMedium[mediumType].limit = available + used;
        });
    }

    return {
        perMedium: perMedium,
    };
}

function getReadThroughput(nodesData: NodesData, mediumList: string[]) {
    // TODO use hammer.aggregation
    const perMedium = initMediumStats(mediumList);

    if (nodesData) {
        const ioStatisticsPerMedia = nodesData.io_statistics_per_medium || {};

        _.each(mediumList, (mediumType) => {
            const rate = ioStatisticsPerMedia[mediumType]?.disk_read_rate || 0;
            const capacity = ioStatisticsPerMedia[mediumType]?.disk_read_capacity || 0;

            perMedium[mediumType].usage = rate;
            perMedium[mediumType].limit = capacity;
        });
    }

    return {
        perMedium: perMedium,
    };
}

function getWriteThroughput(nodesData: NodesData, mediumList: string[]) {
    // TODO use hammer.aggregation
    const perMedium = initMediumStats(mediumList);

    if (nodesData) {
        const ioStatisticsPerMedia = nodesData.io_statistics_per_medium || {};

        _.each(mediumList, (mediumType) => {
            const rate = ioStatisticsPerMedia[mediumType]?.disk_write_rate || 0;
            const capacity = ioStatisticsPerMedia[mediumType]?.disk_write_capacity || 0;

            perMedium[mediumType].usage = rate;
            perMedium[mediumType].limit = capacity;
        });
    }

    return {
        perMedium: perMedium,
    };
}

function getClusterExtendedTotal(clusterTotalsUsage: ClusterTotalsUsage) {
    // TODO use hammer.aggregation
    const settings = initMediumStats(nodesChunksUsageList);

    if (clusterTotalsUsage) {
        const usedSpace = clusterTotalsUsage.total_resource_usage;
        const availableSpace = clusterTotalsUsage.total_resource_limits;

        prepareMediumStats(usedSpace, availableSpace, settings);
    }

    return {
        settings: settings,
    };
}

export function getNodesChunksTotals(clusterTotalsUsage: ClusterTotalsUsage) {
    const list = nodesChunksUsageList;
    const clusterExtendedTotal = getClusterExtendedTotal(clusterTotalsUsage).settings;

    const items = _.map(list, (name) => {
        if (clusterExtendedTotal[name]) {
            const clusterUsage = clusterExtendedTotal[name].usage;
            const clusterLimit = clusterExtendedTotal[name].limit;

            return {
                name: name,
                clusterUsage: {
                    text:
                        hammer.format['Number'](clusterUsage) +
                        ' / ' +
                        hammer.format['Number'](clusterLimit),
                    progress: (clusterUsage / clusterLimit) * 100,
                },
            };
        }

        return null;
    });
    return _.compact(items);
}

export function getDiskSpace(
    _accounts: unknown,
    clusterTotalsUsage: ClusterTotalsUsage,
    nodesData: NodesData,
    mediumList: string[],
) {
    const clusterTotalPerMedium = getClusterTotal(
        clusterTotalsUsage,
        nodesData,
        mediumList,
    ).perMedium;

    const hardwareLimitPerMedium = getHardwareLimit(nodesData, mediumList).perMedium;
    const readThroughput = getReadThroughput(nodesData, mediumList).perMedium;
    const writeThroughput = getWriteThroughput(nodesData, mediumList).perMedium;

    if (clusterTotalPerMedium) {
        return _.map(mediumList, (mediumType) => {
            const clusterUsage = clusterTotalPerMedium[mediumType].usage;
            const clusterLimit = clusterTotalPerMedium[mediumType].limit;
            const hardwareLimit = hardwareLimitPerMedium[mediumType].limit;
            const overcommitted = hardwareLimit < clusterLimit;

            const diskReadRate = readThroughput[mediumType].usage;
            const diskReadCapacity = readThroughput[mediumType].limit;
            const diskWriteRate = writeThroughput[mediumType].usage;
            const diskWriteCapacity = writeThroughput[mediumType].limit;

            return {
                show: hardwareLimit !== 0,
                mediumType: mediumType,
                clusterUsage: {
                    text:
                        hammer.format['Bytes'](clusterUsage) +
                        ' / ' +
                        hammer.format['Bytes'](clusterLimit),
                    progress: (clusterUsage / clusterLimit) * 100,
                },
                readThroughput: {
                    progress: calcProgressProps(
                        diskReadRate,
                        diskReadCapacity,
                        'Bytes',
                        accountsIoThroughputThresholds,
                    ),
                    show: diskReadCapacity > 0,
                },
                writeThroughput: {
                    progress: calcProgressProps(
                        diskWriteRate,
                        diskWriteCapacity,
                        'Bytes',
                        accountsIoThroughputThresholds,
                    ),
                    show: diskWriteCapacity > 0,
                },
                hardwareLimit: hardwareLimit,
                overcommitted,
            };
        });
    }

    return [];
}
