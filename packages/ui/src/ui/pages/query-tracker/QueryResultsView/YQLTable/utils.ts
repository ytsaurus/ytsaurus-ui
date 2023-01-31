export type StrictReactNode =
    | React.ReactChild
    | React.ReactPortal
    | boolean
    | null
    | undefined
    | Array<StrictReactNode>;

export function hasKey<T, K extends PropertyKey>(obj: T, key: K): obj is T & Record<K, T[keyof T]> {
    return typeof obj === 'object' && obj && Reflect.has(obj as any, key);
}
