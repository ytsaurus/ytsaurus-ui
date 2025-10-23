export function applyMissingFields<T extends object>(dst: T, src: Partial<T>) {
    Object.keys(src).forEach((k) => {
        const key = k as keyof typeof src;
        if (key in dst) {
            return;
        } else {
            const v = src[key];
            if (v !== undefined) {
                dst[key] = v;
            }
        }
    });
}
