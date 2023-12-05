import {YTApiId, ytApiV3Id} from '../rum/rum-wrap-api';
import {USE_CACHE, USE_MAX_SIZE} from '../../shared/constants/yt-api';

interface Params {
    path: string;
    attributes?: Array<string>;
}

export function fetchFullList1M(id: YTApiId, {path, attributes = [], ...rest}: Params) {
    return ytApiV3Id.list(id, {path, attributes, ...USE_MAX_SIZE, ...rest});
}

export function listAllUsers(id: YTApiId, {attributes}: Pick<Params, 'attributes'> = {}) {
    return ytApiV3Id.list(id, {
        path: '//sys/users',
        attributes,
        ...USE_MAX_SIZE,
        ...USE_CACHE,
    });
}

export function listAllGroups(id: YTApiId, {attributes}: Pick<Params, 'attributes'> = {}) {
    return ytApiV3Id.list(id, {
        path: '//sys/groups',
        attributes,
        ...USE_MAX_SIZE,
        ...USE_CACHE,
    });
}
