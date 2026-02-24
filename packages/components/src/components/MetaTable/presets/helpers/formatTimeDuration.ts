export function formatTimeDuration(value?: number) {
    if (!value && value !== 0) {
        return '';
    }

    let rest = value;
    let res = '';

    const h = 3600 * 1000;
    const d = 24 * h;
    const M = 30 * d;
    const y = 365 * d;

    const parts = {
        y,
        M,
        d,
        h,
        m: 60 * 1000,
        s: 1000,
        ms: 1,
    };

    Object.keys(parts).forEach((k) => {
        const p: number = parts[k as keyof typeof parts];
        const count = Math.floor(rest / p);
        if (count > 0) {
            res += `${count}${k} `;
            rest -= count * p;
        }
    });

    return res;
}
