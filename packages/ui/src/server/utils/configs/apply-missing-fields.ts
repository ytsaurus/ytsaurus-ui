export function applyMissingFields<T extends object>(draftDst: T, src: Partial<T>) {
    Object.keys(src).forEach((k) => {
        const key = k as keyof typeof src;
        if (key in draftDst) {
            return;
        } else {
            const v = src[key];
            if (v !== undefined) {
                draftDst[key] = v;
            }
        }
    });
}
