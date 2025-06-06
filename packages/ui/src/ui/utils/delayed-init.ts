export function makeObjectWithDelayedInit<D, T extends Record<string, () => unknown>>(
    obj: T,
    {skipUndefined, defaultValue}: {skipUndefined?: boolean; defaultValue: D},
) {
    const __cache: Record<string, any> = {};

    type R = ReturnType<(typeof obj)[keyof typeof obj]>;

    const res = new Proxy(
        {},
        {
            get(_target, p) {
                let res = __cache[p as string];
                if (p in __cache) {
                    return res;
                } else {
                    const v = obj[p as keyof typeof obj]();
                    if (v === undefined && skipUndefined) {
                        return v ?? defaultValue;
                    }
                    res = __cache[p as string] = v;
                }
                return res ?? defaultValue;
            },
        },
    ) as unknown as Record<keyof typeof obj, Exclude<R, undefined> | D>;
    Object.assign(res, {__cache});
    return res;
}
