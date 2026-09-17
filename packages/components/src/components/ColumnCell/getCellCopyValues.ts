import type {TypeArray} from '../SchemaDataType/dataTypes';
import type {LogErrorFn} from '../../types/yt-types';

// Returns escaped and raw clipboard strings independently of the display mode.
export function getCellCopyValues({
    escapedValue,
    rawValue,
    valueType,
    logError,
}: {
    escapedValue: string;
    rawValue: unknown;
    valueType: string | TypeArray | undefined;
    logError?: LogErrorFn;
}) {
    const match = /^"(.*)"$/.exec(escapedValue);
    return {
        string: match ? match[1] : escapedValue,
        rawString:
            typeof rawValue === 'string' && isStringType(valueType, logError)
                ? rawValue
                : undefined,
    };
}

function isStringType(type: string | TypeArray | undefined, logError?: LogErrorFn) {
    if (!type) {
        return false;
    }
    if (typeof type === 'string') {
        return type === 'string';
    }

    try {
        if (type[0] !== 'DataType') {
            return false;
        }
        const lower = type[1].toLowerCase();
        return lower === 'string' || lower === 'json' || lower === 'utf8';
    } catch (error: any) {
        logError?.({message: `ColumnCell: unexpected type: '${JSON.stringify(type)}'`}, error);
        return false;
    }
}
