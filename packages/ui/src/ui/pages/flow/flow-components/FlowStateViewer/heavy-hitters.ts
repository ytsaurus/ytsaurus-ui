import type {
    FlowHeavyHitterEntry,
    FlowHeavyHitterStateSeed,
    FlowHeavyHittersMessageData,
} from './types';

import {Page} from '../../../../../shared/constants/settings';
import type {FlowMessageType} from '../../../../../shared/yt-types';
import ypath from '../../../../common/thor/ypath';

function isUnsignedIntegerText(value: string): boolean {
    return value.length > 0 && [...value].every((char) => char >= '0' && char <= '9');
}

function isIntegerText(value: string): boolean {
    const digits = value.startsWith('-') ? value.slice(1) : value;
    return isUnsignedIntegerText(digits);
}

export function parseHeavyHitterEntry(line: string): FlowHeavyHitterEntry | undefined {
    const ratioSeparator = ', Ratio=';
    const partitionSeparator = ', PartitionId=';
    if (!line.startsWith('Key=')) {
        return undefined;
    }
    const partitionIndex = line.lastIndexOf(partitionSeparator);
    const ratioIndex = line.lastIndexOf(ratioSeparator, partitionIndex - 1);
    if (ratioIndex < 4 || partitionIndex <= ratioIndex) {
        return undefined;
    }
    const ratio = Number(line.slice(ratioIndex + ratioSeparator.length, partitionIndex));
    const partitionId = line.slice(partitionIndex + partitionSeparator.length);
    if (!Number.isFinite(ratio) || !partitionId) {
        return undefined;
    }
    return {keyText: line.slice(4, ratioIndex), ratio, partitionId};
}

function isHeavyHittersTitle(text: string): boolean {
    const tokens = text.split(' ');
    return (
        tokens.length === 4 &&
        tokens[0] === 'Top' &&
        isUnsignedIntegerText(tokens[1]) &&
        tokens[2] === 'heavy' &&
        tokens[3] === 'hitters'
    );
}

function splitKeyToken(token: string): {columnId: number; text: string} | undefined {
    const separatorIndex = token.indexOf('#');
    if (separatorIndex <= 0) {
        return undefined;
    }
    const idText = token.slice(0, separatorIndex);
    return isUnsignedIntegerText(idText)
        ? {columnId: Number(idText), text: token.slice(separatorIndex + 1)}
        : undefined;
}

function parseHeavyHittersMessage(
    message: FlowMessageType,
): FlowHeavyHittersMessageData | undefined {
    const list = ypath.getValue(message.yson);
    if (!Array.isArray(list)) {
        return undefined;
    }
    const entries: Array<FlowHeavyHitterEntry> = [];
    const unparsedEntries: Array<string> = [];
    for (const item of list) {
        const line = ypath.getValue(item);
        if (typeof line !== 'string') {
            unparsedEntries.push(JSON.stringify(line));
            continue;
        }
        const entry = parseHeavyHitterEntry(line);
        if (!entry) {
            unparsedEntries.push(line);
            continue;
        }
        entries.push(entry);
    }
    return {title: message.text?.trim() ?? '', entries, unparsedEntries};
}

export function splitHeavyHittersMessages(messages: Array<FlowMessageType> | undefined): {
    heavyHitters?: FlowHeavyHittersMessageData;
    otherMessages: Array<FlowMessageType>;
} {
    const list = messages ?? [];
    const index = list.findIndex(
        (candidate) =>
            candidate.yson !== undefined && isHeavyHittersTitle(candidate.text?.trim() ?? ''),
    );
    const heavyHitters = index < 0 ? undefined : parseHeavyHittersMessage(list[index]);
    if (!heavyHitters) {
        return {otherMessages: list};
    }
    return {heavyHitters, otherMessages: list.filter((_, position) => position !== index)};
}

function splitKeyTokens(inner: string): Array<string> | undefined {
    const tokens: Array<string> = [];
    let current = '';
    let inQuotes = false;
    for (const char of inner) {
        if (char === '\\') {
            return undefined;
        }
        if (char === '"') {
            inQuotes = !inQuotes;
        }
        if (char === ',' && !inQuotes) {
            tokens.push(current.trim());
            current = '';
            continue;
        }
        current += char;
    }
    if (inQuotes) {
        return undefined;
    }
    tokens.push(current.trim());
    return tokens;
}

function keyValueToText(value: string): string | undefined {
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
    }
    if (value === '%true' || value === '%false') {
        return value.slice(1);
    }
    const digits = value.endsWith('u') ? value.slice(0, -1) : value;
    return isIntegerText(digits) ? digits : undefined;
}

function keyTokenToText(token: string, position: number): string | undefined {
    const withColumnId = splitKeyToken(token);
    if (!withColumnId) {
        return keyValueToText(token);
    }
    return withColumnId.columnId === position ? keyValueToText(withColumnId.text) : undefined;
}

export function parseHeavyHitterKeyText(keyText: string): Array<string> | undefined {
    const trimmed = keyText.trim();
    if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
        return undefined;
    }
    const tokens = splitKeyTokens(trimmed.slice(1, -1).trim());
    if (!tokens) {
        return undefined;
    }
    const parts = tokens.map(keyTokenToText);
    return parts.every((part) => part !== undefined) ? (parts as Array<string>) : undefined;
}

export function buildHeavyHitterStateLink(
    cluster: string,
    pipelinePath: string,
    computationId: string,
    seed: FlowHeavyHitterStateSeed,
): string {
    const params = new URLSearchParams({
        path: pipelinePath,
        heavyHitterSeed: JSON.stringify(seed),
    });
    return `/${cluster}/${Page.FLOWS}/computations/${encodeURIComponent(computationId)}/state?${params}`;
}

export function parseHeavyHitterStateSeed(
    raw: string | null,
): FlowHeavyHitterStateSeed | undefined {
    if (!raw) {
        return undefined;
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return undefined;
    }
    if (!parsed || typeof parsed !== 'object') {
        return undefined;
    }
    const {partitionId, keyValues} = parsed as Record<string, unknown>;
    const seed: FlowHeavyHitterStateSeed = {};
    if (typeof partitionId === 'string') {
        seed.partitionId = partitionId;
    }
    if (keyValues && typeof keyValues === 'object') {
        const entries = Object.entries(keyValues as Record<string, unknown>).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string',
        );
        if (entries.length) {
            seed.keyValues = Object.fromEntries(entries);
        }
    }
    return Object.keys(seed).length ? seed : undefined;
}
