type CreatePrefix<T extends string[]> = T extends [infer U, ...infer V]
    ? U extends string
        ? V extends string[]
            ? `${Uppercase<U>}:${CreatePrefix<V>}`
            : ``
        : ``
    : ``;

export function createPrefix<T extends string[]>(...nameSpaces: T): CreatePrefix<T> {
    return nameSpaces.map((ns) => ns.toUpperCase() + ':').join('') as any;
}

export const RESET_STORE_BEFORE_CLUSTER_CHANGE = 'RESET_STORE_BEFORE_CLUSTER_CHANGE';

export default function createActionTypes<T extends string>(type: T) {
    return {
        REQUEST: `${type}_REQUEST`,
        PARTITION: `${type}_PARTITION`,
        SUCCESS: `${type}_SUCCESS`,
        FAILURE: `${type}_FAILURE`,
        CANCELLED: `${type}_CANCELLED`,
    } as const;
}
