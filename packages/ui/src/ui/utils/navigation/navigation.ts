import qs from 'qs';
import {Page} from '../../constants/index';

export function genNavigationUrl({
    cluster,
    path,
    transaction,
    queryParams,
}: {
    cluster: string;
    path: string;
    transaction?: string;
    queryParams?: Record<string, string | undefined>;
}) {
    const query = qs.stringify(queryParams);

    return `/${cluster}/${Page.NAVIGATION}?path=${encodeURI(path)}${
        transaction ? '&t=' + encodeURI(transaction) : ''
    }${query ? '&' + query : ''}`;
}

export function findCommonPathParent(v1: string, v2: string) {
    let prefix = v1?.length < v2?.length ? v1 : v2;
    const value = v1?.length < v2?.length ? v2 : v1;
    if (prefix === value) {
        return prefix;
    }

    while (prefix.length) {
        const lastSlash = prefix.lastIndexOf('/');
        if (lastSlash === -1) {
            return '';
        }

        prefix = prefix.slice(0, lastSlash + 1);
        if (value.startsWith(prefix)) {
            return prefix;
        } else {
            prefix = prefix.slice(0, lastSlash);
        }
    }

    return '';
}
