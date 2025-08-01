import {YTApiIdType} from '../../shared/constants/yt-api-id';

import {ytApiV3Id} from '../rum/rum-wrap-api';
import {USE_CACHE, USE_MAX_SIZE} from '../../shared/constants/yt-api';
import ytLocalStorage from './yt-local-storage';

interface Params {
    path: string;
    attributes?: Array<string>;
}

export function fetchFullList1M(id: YTApiIdType, {path, attributes = [], ...rest}: Params) {
    return ytApiV3Id.list(id, {path, attributes, ...USE_MAX_SIZE, ...rest});
}

export function disableUsersCache() {
    ytLocalStorage.set('users_disabled_cache_end_time', Date.now() + 15 * 1000);
}

function isUsersCacheEnabled() {
    const usersDisabledCacheEndTime = ytLocalStorage.get('users_disabled_cache_end_time') || 0;

    return usersDisabledCacheEndTime < Date.now();
}

export function listAllUsers(id: YTApiIdType, {attributes}: Pick<Params, 'attributes'> = {}) {
    const useCache = isUsersCacheEnabled();

    return ytApiV3Id.list(id, {
        path: '//sys/users',
        attributes,
        ...USE_MAX_SIZE,
        ...(useCache ? USE_CACHE : null),
    });
}

export function disableGroupsCache() {
    ytLocalStorage.set('groups_disabled_cache_end_time', Date.now() + 15 * 1000);
}

function isGroupsCacheEnabled() {
    const groupsDisabledCacheEndTime = ytLocalStorage.get('groups_disabled_cache_end_time') || 0;

    return groupsDisabledCacheEndTime < Date.now();
}

export function listAllGroups(id: YTApiIdType, {attributes}: Pick<Params, 'attributes'> = {}) {
    const useCache = isGroupsCacheEnabled();

    return ytApiV3Id.list(id, {
        path: '//sys/groups',
        attributes,
        ...USE_MAX_SIZE,
        ...(useCache ? USE_CACHE : null),
    });
}
