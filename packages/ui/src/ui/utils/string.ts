export function unquote<T extends string>(value: T) {
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
    }
    return value;
}
