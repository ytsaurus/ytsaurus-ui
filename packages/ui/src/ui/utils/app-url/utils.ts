import {LocationParameters} from '../../store/location';

export function makeURLSearchParams<T extends object>(params: T, info: LocationParameters) {
    const res = new URLSearchParams();
    Object.keys(params).reduce((acc, k) => {
        const value = params[k as keyof T];
        if (k in info) {
            if (info[k].options?.serialize) {
                const tmp = info[k].options?.serialize?.(value);
                if (tmp !== undefined) {
                    res.append(k, tmp + '');
                }
            } else {
                res.append(k, value + '');
            }
        }
        return acc;
    }, res);
    return res;
}
