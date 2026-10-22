import ytLocalStorage from '../utils/yt-local-storage';

const YT_CACHE_DISABLED_UNTIL = 'ytCacheDisabledUntil';

const CACHE_PARAMS = {
    read_from: 'cache',
    disable_per_user_cache: true,
} as const;

export function disableYTCacheTemporarily() {
    ytLocalStorage.set(YT_CACHE_DISABLED_UNTIL, Date.now() + 15_000);
}

export function USE_CACHE(): Partial<typeof CACHE_PARAMS> {
    if ((ytLocalStorage.get(YT_CACHE_DISABLED_UNTIL) ?? 0) > Date.now()) {
        return {};
    }

    return CACHE_PARAMS;
}

const LIST_MAX_SIZE = 1000000;

export const USE_MAX_SIZE = {
    max_size: LIST_MAX_SIZE,
};
