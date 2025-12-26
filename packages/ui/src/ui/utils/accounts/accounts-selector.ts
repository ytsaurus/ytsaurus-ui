import camelCase_ from 'lodash/camelCase';
import capitalize_ from 'lodash/capitalize';
import forEach_ from 'lodash/forEach';
import replace_ from 'lodash/replace';
import some_ from 'lodash/some';

import ypath from '../../common/thor/ypath';

import {AccountResourceInfo} from '../../constants/accounts/accounts';
import {computeProgress, getProgressTheme} from '../../utils/progress';
import formatLib from '../../common/hammer/format';
import {FIX_MY_TYPE} from '../../types';

export function accountMemoryMediumToFieldName(path: string) {
    return replace_(path, /\//g, '_');
}

export interface AccountParsedData {
    $attributes: any;
    $value: string;

    name: string;
    parent: string;
    abc: {id: number; slug: string};

    stats: string; // stats url;

    responsibleUsers: Array<string>; // TODO: remove me later
    responsibleUsersSet: Set<string>; // TODO: remove me later

    hasRecursiveResources: boolean;
    recursiveResources: Record<string, AccountResources>;

    master_memory_detailed: {
        nodes: number;
        chunks: number;
        attributes: number;
        tablets: number;
        schemas: number;
    };

    ownAlertsCount: number;
    alertsCount: number;

    masterMemoryResources: Record<string, AccountResourceInfo>;
    perMedium: Record<string, unknown>;
}

interface AccountResources {}

export function parseAccountData(data: any) {
    const dst: AccountParsedData = {
        recursiveResources: {},
        masterMemoryResources: {},
    } as any;

    dst.$value = data.$value;
    dst.name = dst.$value;
    dst.$attributes = data.$attributes;

    dst.abc = dst.$attributes.abc || {};
    dst.responsibleUsers = Array.isArray(dst.$attributes.responsibles)
        ? dst.$attributes.responsibles
        : [];
    dst.responsibleUsersSet = new Set(dst.responsibleUsers);
    dst.parent = dst.$attributes.parent_name;

    dst.hasRecursiveResources = Boolean(ypath.getValue(dst, '/@recursive_resource_usage'));
    dst.recursiveResources = {};

    updateResource(dst, dst.$attributes, 'chunk_count', 'Number');
    updateResource(dst, dst.$attributes, 'node_count', 'Number');

    updateResource(dst, dst.$attributes, 'tablet_count', 'Number');
    updateResource(dst, dst.$attributes, 'tablet_static_memory', 'Bytes');

    updateResourcePerMedium(dst, dst.$attributes, 'disk_space', 'Bytes');

    updateMasterMemory(dst, dst.$attributes);

    dst.alertsCount = getAccountAlertsCount(dst);

    return dst;
}

function updateMasterMemory(dst: AccountParsedData, attributes: any) {
    prepareResource(dst, attributes, 'master_memory/total', 'Bytes');
    prepareResource(dst, attributes, 'master_memory/chunk_host', 'Bytes');

    const perCell = ypath.getValue(attributes, '/resource_usage/master_memory/per_cell');
    forEach_(perCell, (_value, key) => {
        prepareResource(dst, attributes, `master_memory/per_cell/${key}`, 'Bytes');
    });

    dst.master_memory_detailed = ypath.getValue(
        attributes,
        '/resource_usage/detailed_master_memory',
    );
}

function prepareResource(
    dst: AccountParsedData,
    resourceAttributes: any,
    path: string,
    format: 'Bytes' | 'Number',
) {
    const name = accountMemoryMediumToFieldName(path);
    const committed = ypath.getValue(resourceAttributes, '/committed_resource_usage/' + path);
    const limit = ypath.getValue(resourceAttributes, '/resource_limits/' + path);
    (dst as FIX_MY_TYPE)[name] = prepareResourceInfo(
        {
            total: ypath.getValue(resourceAttributes, '/resource_usage/' + path),
            committed,
            limit,
        },
        format,
    );

    if (dst.hasRecursiveResources) {
        const recursiveUsage = ypath.getValue(
            resourceAttributes,
            '/recursive_resource_usage/' + path,
        );
        const recursiveCommitted = ypath.getValue(
            resourceAttributes,
            '/recursive_committed_resource_usage/' + path,
        );
        dst.recursiveResources[name] = prepareResourceInfo(
            {
                total: recursiveUsage,
                committed: recursiveCommitted,
                limit: ypath.getValue(resourceAttributes, '/resource_limits/' + path),
            },
            format,
        );
    }
}

function updateResource(
    dst: AccountParsedData,
    attributes: any,
    name: string,
    format: 'Bytes' | 'Number',
    nameYPath = name,
) {
    const committed = ypath.getValue(attributes, '/committed_resource_usage/' + nameYPath);
    const limit = ypath.getValue(attributes, '/resource_limits/' + nameYPath);
    Object.assign(
        dst,
        updateResourceFields(
            {
                total: ypath.getValue(attributes, '/resource_usage/' + nameYPath),
                committed,
                limit,
            },
            name,
            format,
        ),
    );

    if (dst.hasRecursiveResources) {
        const recursiveUsage = ypath.getValue(attributes, '/recursive_resource_usage/' + nameYPath);
        const recursiveCommitted = ypath.getValue(
            attributes,
            '/recursive_committed_resource_usage/' + nameYPath,
        );
        Object.assign(
            dst.recursiveResources,
            updateResourceFields(
                {
                    total: recursiveUsage,
                    committed: recursiveCommitted,
                    limit: ypath.getValue(attributes, '/resource_limits/' + nameYPath),
                },
                name,
                format,
            ),
        );
    }
}

function updateResourcePerMedium(
    dst: AccountParsedData,
    attributes: any,
    name: string,
    format: 'Bytes' | 'Number',
) {
    const path = 'disk_space_per_medium';
    const recursiveTotalPerMedium = ypath.getValue(attributes, '/recursive_resource_usage/' + path);
    const recursiveCommittedPerMedium = ypath.getValue(
        attributes,
        '/recursive_committed_resource_usage/' + path,
    );
    const totalPerMedium = ypath.getValue(attributes, '/resource_usage/' + path);
    const committedPerMedium = ypath.getValue(attributes, '/committed_resource_usage/' + path);
    const limitPerMedium = ypath.getValue(attributes, '/resource_limits/' + path);

    dst.perMedium = {};
    forEach_(totalPerMedium, (mediumData, mediumName) => {
        dst.perMedium[mediumName] = updateResourceFields(
            {
                total: mediumData,
                committed: committedPerMedium[mediumName],
                limit: limitPerMedium[mediumName],
            },
            name,
            format,
        );
    });

    let lastMedium;
    try {
        if (dst.hasRecursiveResources) {
            dst.recursiveResources.perMedium = {};
            forEach_(recursiveTotalPerMedium, (mediumData, mediumName) => {
                lastMedium = mediumName;
                (dst.recursiveResources as FIX_MY_TYPE).perMedium[mediumName] =
                    updateResourceFields(
                        {
                            total: mediumData,
                            committed: recursiveCommittedPerMedium[mediumName],
                            limit: limitPerMedium?.[mediumName] ?? 0,
                        },
                        name,
                        format,
                    );
            });
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log({attributes, limitPerMedium, path, lastMedium});
        throw e;
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
