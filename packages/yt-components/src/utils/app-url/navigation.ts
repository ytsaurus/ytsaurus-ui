import {ValueOf} from '../../types';
import {NavigationTab, TabletErrorsByPathState} from '../../types/navigation';
import {Page} from '../../constants';

export function makeNavigationLink(params: {
    path: string;
    cluster?: string;
    navmode?: ValueOf<typeof NavigationTab>;
    teMode?: 'request_errors';
    teTime?: TabletErrorsByPathState['timeRangeFilter'];
    teMethods?: Array<string>;
}) {
    const {cluster: clusterFromParams, ...rest} = params;

    let cluster = clusterFromParams;
    let currentSearch = '';

    if (typeof window !== 'undefined') {
        const {pathname, search} = window.location;
        currentSearch = search || '';

        if (!cluster) {
            const segments = pathname.split('/').filter(Boolean);
            if (segments.length > 0) {
                cluster = segments[0];
            }
        }
    }

    const res = `/${cluster ?? ''}/${Page.NAVIGATION}`;

    const searchParams = new URLSearchParams(currentSearch);

    (Object.keys(rest) as Array<keyof typeof rest>).forEach((key) => {
        const value = rest[key];
        if (value === undefined) {
            return;
        }

        const name = String(key);

        if (Array.isArray(value)) {
            searchParams.delete(name);
            value.forEach((item) => searchParams.append(name, String(item)));
        } else {
            searchParams.set(name, String(value));
        }
    });

    const search = searchParams.toString();
    return search ? `${res}?${search}` : res;
}
