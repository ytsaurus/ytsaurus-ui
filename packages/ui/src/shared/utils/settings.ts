export const NS_SEPARATOR = '::';

export function getPath<Name extends string, Value extends string>(
    name: Name,
    parentNS: {value: Value},
): `${Value}${typeof NS_SEPARATOR}${Name}` {
    return `${parentNS.value}${NS_SEPARATOR}${name}`;
}

/**
 * Create a namespace for settings, valid charachters [a-zA-Z-]
 */
export function createNS<Name extends string>(name: Name) {
    return {
        value: name,
        name: name,
        parent: undefined,
    };
}

export function createNestedNS<Name extends string, Value extends string>(
    name: Name,
    parent: {value: Value},
) {
    return {
        value: getPath(name, parent),
        name,
        parent,
    };
}

export interface SettingNS {
    value: string;
    name: string;
    parent?: {value: string};
}
