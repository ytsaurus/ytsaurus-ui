type SnakeToCamel<T extends string> = T extends `${infer First}_${infer Second}${infer Rest}`
    ? `${First}${Capitalize<Second>}${SnakeToCamel<Rest>}`
    : T;

export function snakeToCamel<K extends string>(str: K): SnakeToCamel<K> {
    return str.replace(/_\w/g, (x) => {
        return x[1].toUpperCase();
    }) as any;
}

type SnakeToCamelObject<T extends Record<string, unknown>> = {
    [K in keyof T as SnakeToCamel<K & string>]: T[K];
};

export function snakeToCamelObject<T extends Record<string, unknown>>(
    obj?: T,
): SnakeToCamelObject<T> | undefined {
    if (!obj) {
        return obj;
    }
    return Object.keys(obj).reduce((acc, k) => {
        Object.assign(acc, {[snakeToCamel(k)]: obj[k]});
        return acc;
    }, {} as SnakeToCamelObject<T>);
}
