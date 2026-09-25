import camelCase_ from 'lodash/camelCase';
import capitalize_ from 'lodash/capitalize';
import forEach_ from 'lodash/forEach';
import replace_ from 'lodash/replace';
import some_ from 'lodash/some';

import ypath from '../../common/thor/ypath';

import {type AccountResourceInfo} from '../../constants/accounts/accounts';
import {computeProgress, getProgressTheme} from '../../utils/progress';
import formatLib from '../../common/hammer/format';
import {type FIX_MY_TYPE} from '../../types';
import {type CypressNode, type CypressNodeRaw} from '../../../shared/yt-types';
import {type FieldTree} from '../../common/hammer/field-tree';

type YsonNode<T> = CypressNodeRaw<Record<string, unknown>, T>;
type YsonRecord<Key extends string, Value> = YsonNode<Record<Key, YsonNode<Value>>>;

interface MasterMemoryYson {
    total?: YsonNode<number>;
    chunk_host?: YsonNode<number>;
    per_cell?: YsonRecord<string, number>;
}

interface DetailedMasterMemoryYson {
    nodes?: YsonNode<number>;
    chunks?: YsonNode<number>;
    attributes?: YsonNode<number>;
    tablets?: YsonNode<number>;
    schemas?: YsonNode<number>;
}

interface AccountResourceYson {
    node_count?: YsonNode<number>;
    chunk_count?: YsonNode<number>;
    tablet_count?: YsonNode<number>;
    tablet_static_memory?: YsonNode<number>;
    disk_space_per_medium?: YsonRecord<string, number>;
    master_memory?: YsonNode<MasterMemoryYson>;
    detailed_master_memory?: YsonNode<DetailedMasterMemoryYson>;
}

interface AccountAbc {
    id: number;
    slug: string;
}

type AccountAttributes = {
    abc?: Partial<AccountAbc>;
    parent_name?: string;
    responsibles?: Array<string>;
    resource_usage?: YsonNode<AccountResourceYson>;
    committed_resource_usage?: YsonNode<AccountResourceYson>;
    resource_limits?: YsonNode<AccountResourceYson>;
    recursive_resource_usage?: YsonNode<AccountResourceYson>;
    recursive_committed_resource_usage?: YsonNode<AccountResourceYson>;
    recursive_violated_resource_limits?: FieldTree<number>;
};

export type AccountInput = CypressNode<AccountAttributes, string>;

interface ResourceSources<T> {
    resourceUsage: T;
    committedResourceUsage: T;
    resourceLimits: T;
    recursiveResourceUsage: T;
    recursiveCommittedResourceUsage: T;
}

type AccountResourceSources = ResourceSources<AccountResourceYson>;

export function accountMemoryMediumToFieldName(path: string) {
    return replace_(path, /\//g, '_');
}

export interface AccountParsedData {
    $attributes: AccountAttributes;
    $value: string;

    name: string;
    parent: string;
    abc: AccountAbc;

    stats: string; // stats url;

    responsibleUsers: Array<string>; // TODO: remove me later
    responsibleUsersSet: Set<string>; // TODO: remove me later

    hasRecursiveResources: boolean;
    recursiveResources: Record<string, AccountResources>;

    master_memory_detailed?: {
        nodes?: number;
        chunks?: number;
        attributes?: number;
        tablets?: number;
        schemas?: number;
    };

    ownAlertsCount: number;
    alertsCount: number;

    masterMemoryResources: Record<string, AccountResourceInfo>;
    perMedium: Record<string, unknown>;
}

interface AccountResources {}

function getValue<T>(value: YsonNode<T> | undefined): T | undefined {
    return ypath.getValue(value) as T | undefined;
}

export function parseAccountData(data: AccountInput) {
    const dst: AccountParsedData = {
        recursiveResources: {},
        masterMemoryResources: {},
    } as any;

    dst.$value = data.$value;
    dst.name = dst.$value;
    dst.$attributes = data.$attributes;

    dst.abc = (dst.$attributes.abc || {}) as AccountAbc;
    dst.responsibleUsers = Array.isArray(dst.$attributes.responsibles)
        ? dst.$attributes.responsibles
        : [];
    dst.responsibleUsersSet = new Set(dst.responsibleUsers);
    dst.parent = dst.$attributes.parent_name as string;

    const recursiveResourceUsage = getValue(dst.$attributes.recursive_resource_usage);
    const resourceSources: AccountResourceSources = {
        resourceUsage: getValue(dst.$attributes.resource_usage) || {},
        committedResourceUsage: getValue(dst.$attributes.committed_resource_usage) || {},
        resourceLimits: getValue(dst.$attributes.resource_limits) || {},
        recursiveResourceUsage: recursiveResourceUsage || {},
        recursiveCommittedResourceUsage:
            getValue(dst.$attributes.recursive_committed_resource_usage) || {},
    };
    dst.hasRecursiveResources = Boolean(recursiveResourceUsage);
    dst.recursiveResources = {};

    updateResource(dst, resourceSources, 'chunk_count', 'Number');
    updateResource(dst, resourceSources, 'node_count', 'Number');

    updateResource(dst, resourceSources, 'tablet_count', 'Number');
    updateResource(dst, resourceSources, 'tablet_static_memory', 'Bytes');

    updateResourcePerMedium(dst, resourceSources, 'disk_space', 'Bytes');

    updateMasterMemory(dst, resourceSources);

    dst.alertsCount = getAccountAlertsCount(dst);

    return dst;
}

function updateMasterMemory(dst: AccountParsedData, sources: AccountResourceSources) {
    const masterMemorySources: ResourceSources<MasterMemoryYson> = {
        resourceUsage: getValue(sources.resourceUsage.master_memory) || {},
        committedResourceUsage: getValue(sources.committedResourceUsage.master_memory) || {},
        resourceLimits: getValue(sources.resourceLimits.master_memory) || {},
        recursiveResourceUsage: getValue(sources.recursiveResourceUsage.master_memory) || {},
        recursiveCommittedResourceUsage:
            getValue(sources.recursiveCommittedResourceUsage.master_memory) || {},
    };

    prepareResource(
        dst,
        'master_memory_total',
        getResourceValues(masterMemorySources, 'total'),
        'Bytes',
    );
    prepareResource(
        dst,
        'master_memory_chunk_host',
        getResourceValues(masterMemorySources, 'chunk_host'),
        'Bytes',
    );

    const perCellSources: ResourceSources<Record<string, YsonNode<number>>> = {
        resourceUsage: getValue(masterMemorySources.resourceUsage.per_cell) || {},
        committedResourceUsage: getValue(masterMemorySources.committedResourceUsage.per_cell) || {},
        resourceLimits: getValue(masterMemorySources.resourceLimits.per_cell) || {},
        recursiveResourceUsage: getValue(masterMemorySources.recursiveResourceUsage.per_cell) || {},
        recursiveCommittedResourceUsage:
            getValue(masterMemorySources.recursiveCommittedResourceUsage.per_cell) || {},
    };
    forEach_(perCellSources.resourceUsage, (_value, key) => {
        prepareResource(
            dst,
            `master_memory_per_cell_${key}`,
            getResourceValues(perCellSources, key),
            'Bytes',
        );
    });

    const detailed = getValue(sources.resourceUsage.detailed_master_memory);
    dst.master_memory_detailed = detailed && {
        nodes: getValue(detailed.nodes),
        chunks: getValue(detailed.chunks),
        attributes: getValue(detailed.attributes),
        tablets: getValue(detailed.tablets),
        schemas: getValue(detailed.schemas),
    };
}

function getResourceValues<T, Key extends keyof T>(sources: ResourceSources<T>, key: Key) {
    return {
        total: sources.resourceUsage[key],
        committed: sources.committedResourceUsage[key],
        limit: sources.resourceLimits[key],
        recursiveTotal: sources.recursiveResourceUsage[key],
        recursiveCommitted: sources.recursiveCommittedResourceUsage[key],
    };
}

function prepareResource(
    dst: AccountParsedData,
    name: string,
    values: {
        total?: YsonNode<number>;
        committed?: YsonNode<number>;
        limit?: YsonNode<number>;
        recursiveTotal?: YsonNode<number>;
        recursiveCommitted?: YsonNode<number>;
    },
    format: 'Bytes' | 'Number',
) {
    const committed = getValue(values.committed);
    const limit = getValue(values.limit);
    (dst as FIX_MY_TYPE)[name] = prepareResourceInfo(
        {
            total: getValue(values.total),
            committed,
            limit,
        },
        format,
    );

    if (dst.hasRecursiveResources) {
        dst.recursiveResources[name] = prepareResourceInfo(
            {
                total: getValue(values.recursiveTotal),
                committed: getValue(values.recursiveCommitted),
                limit,
            },
            format,
        );
    }
}

type ScalarResourceName = 'chunk_count' | 'node_count' | 'tablet_count' | 'tablet_static_memory';

function updateResource(
    dst: AccountParsedData,
    sources: AccountResourceSources,
    name: ScalarResourceName,
    format: 'Bytes' | 'Number',
) {
    const committed = getValue(sources.committedResourceUsage[name]);
    const limit = getValue(sources.resourceLimits[name]);
    Object.assign(
        dst,
        updateResourceFields(
            {
                total: getValue(sources.resourceUsage[name]),
                committed,
                limit,
            },
            name,
            format,
        ),
    );

    if (dst.hasRecursiveResources) {
        const recursiveUsage = getValue(sources.recursiveResourceUsage[name]);
        const recursiveCommitted = getValue(sources.recursiveCommittedResourceUsage[name]);
        Object.assign(
            dst.recursiveResources,
            updateResourceFields(
                {
                    total: recursiveUsage,
                    committed: recursiveCommitted,
                    limit,
                },
                name,
                format,
            ),
        );
    }
}

function updateResourcePerMedium(
    dst: AccountParsedData,
    sources: AccountResourceSources,
    name: string,
    format: 'Bytes' | 'Number',
) {
    const path = 'disk_space_per_medium';
    const recursiveTotalPerMedium = getValue(sources.recursiveResourceUsage[path]) || {};
    const recursiveCommittedPerMedium =
        getValue(sources.recursiveCommittedResourceUsage[path]) || {};
    const totalPerMedium = getValue(sources.resourceUsage[path]) || {};
    const committedPerMedium = getValue(sources.committedResourceUsage[path]) || {};
    const limitPerMedium = getValue(sources.resourceLimits[path]) || {};

    dst.perMedium = {};
    forEach_(totalPerMedium, (mediumData, mediumName) => {
        dst.perMedium[mediumName] = updateResourceFields(
            {
                total: getValue(mediumData),
                committed: getValue(committedPerMedium[mediumName]),
                limit: getValue(limitPerMedium[mediumName]),
            },
            name,
            format,
        );
    });

    if (dst.hasRecursiveResources) {
        dst.recursiveResources.perMedium = {};
        forEach_(recursiveTotalPerMedium, (mediumData, mediumName) => {
            (dst.recursiveResources as FIX_MY_TYPE).perMedium[mediumName] = updateResourceFields(
                {
                    total: getValue(mediumData),
                    committed: getValue(recursiveCommittedPerMedium[mediumName]),
                    limit: getValue(limitPerMedium[mediumName]) ?? 0,
                },
                name,
                format,
            );
        });
    }
}

function prepareResourceInfo(
    data: {total?: number; committed?: number; limit?: number},
    format: 'Bytes' | 'Number',
): AccountResourceInfo {
    const total = data.total || 0;
    const committed = data.committed || 0;
    const limit = data.limit || 0;

    const uncommitted = total - committed;

    const progressText =
        formatLib[format](committed) +
        (uncommitted >= 0 ? ' + ' : ' - ') +
        formatLib[format](Math.abs(uncommitted)) +
        ' / ' +
        formatLib[format](limit);

    const progress = computeProgress(total, limit) ?? 0;
    const theme = getProgressTheme((committed / limit) * 100);

    return {
        committed,
        uncommitted,
        total,
        limit,
        theme,
        progress,
        progressText,
    };
}

function capitalizeFirstLetter(text: string) {
    return capitalize_(text[0]) + text.slice(1);
}

/**
 * @deprecated use prepareResourceInfo instead of it
 * @param data
 * @param format
 */
function updateResourceFields(
    data: {total?: number; committed?: number; limit?: number},
    name: string,
    format: 'Bytes' | 'Number',
) {
    const target: any = {};
    const total = data.total || 0;
    const committed = data.committed || 0;
    const limit = data.limit || 0;

    const uncommitted = total - committed;

    const camelCaseName = camelCase_(name);
    const capitalizedCamelCaseName = capitalizeFirstLetter(camelCaseName);

    target['committed' + capitalizedCamelCaseName] = committed;
    target['total' + capitalizedCamelCaseName] = total;
    target['uncommitted' + capitalizedCamelCaseName] = uncommitted;

    target[camelCaseName + 'Limit'] = limit;
    target[camelCaseName + 'ProgressText'] =
        formatLib[format](committed) +
        (uncommitted >= 0 ? ' + ' : ' - ') +
        formatLib[format](Math.abs(uncommitted)) +
        ' / ' +
        formatLib[format](limit);

    const progress = (target[camelCaseName + 'Progress'] = computeProgress(total, limit));

    target[camelCaseName + 'ProgressTheme'] = getProgressTheme(
        name === 'node_count' ? (committed / limit) * 100 : progress,
    );

    return target;
}

function getAccountAlertsCount(dst: AccountParsedData) {
    let res = 0;
    const {recursive_violated_resource_limits: recursiveViolatedLimits} = dst.$attributes;
    visitResourceFields(recursiveViolatedLimits, (value: number) => {
        res += value;
    });
    return res;
}

/**
 * Returns true if stopped
 * @param container
 * @param stopFn
 * @returns {*}
 */
export function visitResourceFields(container: any, stopFn: (value: number, path: string) => void) {
    if (!container) {
        return;
    }
    const {
        // disk_space will be removed later and it should not be visited
        disk_space: _diskSpace,
        disk_space_per_medium: perMedium,
        master_memory: _masterMemory,
        ...rest
    } = container;
    visitNumberOrGoDeep(rest, '', stopFn);
    visitNumberOrGoDeep(perMedium, 'medium', stopFn);
}

function visitNumberOrGoDeep(
    value: any,
    path: string,
    stopFn: (value: number, path: string) => void,
) {
    if (!isNaN(value)) {
        stopFn(value, path);
    } else {
        some_(value, (item, key) => {
            visitNumberOrGoDeep(item, path ? `${path}/${key}` : key, stopFn);
        });
    }
}
