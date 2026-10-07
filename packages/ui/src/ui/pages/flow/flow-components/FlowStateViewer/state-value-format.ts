import type {YsonSettings} from '../../../../components/Yson/Yson';
import {isAnnotatedBigInteger} from '../../../../store/api/yt/flow/read-states-normalize';

function replaceAnnotatedIntegers(_key: string, value: unknown): unknown {
    return isAnnotatedBigInteger(value) ? value.$value : value;
}

export function stringifyStateValue(value: unknown, maxLength = 200): string {
    if (isAnnotatedBigInteger(value)) {
        return value.$value;
    }
    const text = JSON.stringify(value, replaceAnnotatedIntegers);
    if (text === undefined) {
        return '';
    }
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export function serializeRawStateValue(value: unknown): string {
    const text = JSON.stringify(value);
    return text === undefined ? '' : text;
}

export function buildCompactYsonSettings(base: YsonSettings): YsonSettings {
    return {...base, compact: true, indent: 0, break: false};
}
