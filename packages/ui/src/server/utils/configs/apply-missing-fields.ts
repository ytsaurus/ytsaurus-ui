export function applyMissingFields<T extends object>(accDst: T, src: Partial<T>) {
    Object.keys(src).forEach((k) => {
        const key = k as keyof typeof src;
        if (key in accDst) {
            return;
        } else {
            const v = src[key];
            if (v !== undefined) {
                accDst[key] = v;
            }
        }
    });
}
