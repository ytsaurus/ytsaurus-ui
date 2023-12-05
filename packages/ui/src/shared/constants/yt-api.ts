export const USE_CACHE = {
    read_from: 'cache',
    disable_per_user_cache: true,
} as const;

const LIST_MAX_SIZE = 1000000;

export const USE_MAX_SIZE = {
    max_size: LIST_MAX_SIZE,
};
