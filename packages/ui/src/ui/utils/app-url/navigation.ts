import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';
import type {Tab as NavigationTab} from '../../constants/navigation';
import {ValueOf} from '../../types';

import {TabletErrorsByPathState} from '../../store/reducers/navigation/tabs/tablet-errors/tablet-errors-by-path';
import {getNavigationParams} from '../../store/reducers/navigation/url-mapping';
import {makeURLSearchParams} from './utils';

export function makeNavigationLink(params: {
    path: string;
    cluster?: string;
    navmode?: ValueOf<typeof NavigationTab>;
    teMode?: 'request_errors';
    teTime?: TabletErrorsByPathState['timeRangeFilter'];
    teMethods?: Array<string>;
}) {
    const {cluster, ...rest} = params;
    const res = `/${cluster || YT.cluster}/${Page.NAVIGATION}`;
    const search = makeURLSearchParams(rest, getNavigationParams()).toString();
    return search ? `${res}?${search}` : res;
}
