import type {FlowStateResultRow, FlowStateStorageLocation} from './types';

import type {FlowStaticSpec} from '../../../../../shared/yt-types';
import ypath from '../../../../common/thor/ypath';
import {getOwnProperty} from './state-schema';

const UNQUOTED_CLUSTER_PATTERN = /^[A-Za-z0-9_.-]+$/;

function splitRichPathAttributes(
    path: string,
): {attributes: string; cypressPath: string} | undefined {
    if (!path.startsWith('<')) {
        return {attributes: '', cypressPath: path};
    }
    let depth = 0;
    let insideQuotes = false;
    let escaped = false;
    for (let index = 0; index < path.length; index += 1) {
        const character = path[index];
        if (insideQuotes) {
            if (escaped) {
                escaped = false;
            } else if (character === '\\') {
                escaped = true;
            } else if (character === '"') {
                insideQuotes = false;
            }
            continue;
        }
        if (character === '"') {
            insideQuotes = true;
        } else if (character === '<') {
            depth += 1;
        } else if (character === '>') {
            depth -= 1;
            if (depth === 0) {
                return {
                    attributes: path.slice(1, index),
                    cypressPath: path.slice(index + 1).replace(/^ +/, ''),
                };
            }
        }
    }
    return undefined;
}

function splitTopLevelAttributes(attributes: string): Array<string> {
    const items: Array<string> = [];
    let item = '';
    let depth = 0;
    let insideQuotes = false;
    let escaped = false;
    for (const character of attributes) {
        if (insideQuotes) {
            item += character;
            if (escaped) {
                escaped = false;
            } else if (character === '\\') {
                escaped = true;
            } else if (character === '"') {
                insideQuotes = false;
            }
            continue;
        }
        if (character === '"') {
            insideQuotes = true;
            item += character;
        } else if ('<[{'.includes(character)) {
            depth += 1;
            item += character;
        } else if ('>]}'.includes(character)) {
            depth -= 1;
            item += character;
        } else if (character === ';' && depth === 0) {
            items.push(item);
            item = '';
        } else {
            item += character;
        }
    }
    items.push(item);
    return items;
}

function decodeAttributeString(token: string): string | undefined {
    const trimmed = token.trim();
    if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
        try {
            const decoded: unknown = JSON.parse(trimmed);
            return typeof decoded === 'string' ? decoded : undefined;
        } catch {
            return undefined;
        }
    }
    return UNQUOTED_CLUSTER_PATTERN.test(trimmed) ? trimmed : undefined;
}

function findClusterAttribute(attributes: string): string | undefined {
    for (const item of splitTopLevelAttributes(attributes)) {
        const separator = item.indexOf('=');
        if (separator > 0 && decodeAttributeString(item.slice(0, separator)) === 'cluster') {
            return decodeAttributeString(item.slice(separator + 1));
        }
    }
    return undefined;
}

export function parseRichStoragePath(path: string): FlowStateStorageLocation | undefined {
    const split = splitRichPathAttributes(path);
    if (!split || !split.cypressPath.length) {
        return undefined;
    }
    return {
        path: split.cypressPath,
        cluster: split.attributes ? findClusterAttribute(split.attributes) : undefined,
    };
}

export function resolveStateStoragePath(
    row: FlowStateResultRow,
    pipelinePath: string,
    spec: FlowStaticSpec | undefined,
): FlowStateStorageLocation | undefined {
    if (row.section === 'key_state') {
        return {path: `${pipelinePath}/states`};
    }
    if (row.section === 'partition_state') {
        return {path: `${pipelinePath}/partition_states`};
    }
    if (!row.computationId) {
        return undefined;
    }
    const computation = getOwnProperty(spec?.computations, row.computationId);
    const declarationsNode =
        row.section === 'external_key_state'
            ? getOwnProperty(computation, 'external_state_managers')
            : getOwnProperty(computation, 'external_state_joiners');
    const declarations = ypath.getValue(declarationsNode);
    const declaration = ypath.getValue(getOwnProperty(declarations, row.stateName));
    const parameters = ypath.getValue(getOwnProperty(declaration, 'parameters'));
    const pathNode = getOwnProperty(parameters, 'path');
    const path = ypath.getValue(pathNode);
    if (typeof path !== 'string' || !path.length) {
        return undefined;
    }
    const parsed = parseRichStoragePath(path);
    if (!parsed) {
        return undefined;
    }
    const annotatedCluster = getOwnProperty(ypath.getAttributes(pathNode), 'cluster');
    return {
        path: parsed.path,
        cluster:
            parsed.cluster ?? (typeof annotatedCluster === 'string' ? annotatedCluster : undefined),
    };
}
