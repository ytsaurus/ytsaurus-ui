interface CacheEntry<TResult> {
    promise: Promise<TResult>;
    lastAccessTime: number;
    updateTimeoutId?: ReturnType<typeof setTimeout>;
}

const MAX_IDLE_TIME = 10 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

export function createAutoUpdatedCache<TKey, TRest extends any[], TResult>(
    getter: (key: TKey, ...rest: TRest) => Promise<TResult>,
    cacheTime: number,
) {
    const store = new Map<TKey, CacheEntry<TResult>>();

    const cleanupEntry = (key: TKey) => {
        const entry = store.get(key);
        if (entry?.updateTimeoutId) {
            clearTimeout(entry.updateTimeoutId);
        }
        store.delete(key);
    };

    const evictLeastRecentlyUsedEntries = () => {
        if (store.size < MAX_CACHE_SIZE) {
            return;
        }

        const entries = Array.from(store.entries()).sort(
            ([, a], [, b]) => a.lastAccessTime - b.lastAccessTime,
        );

        const entriesToRemove = Math.max(1, Math.floor(MAX_CACHE_SIZE * 0.1));
        for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
            cleanupEntry(entries[i][0]);
        }
    };

    const triggerUpdate = (
        key: TKey,
        saveImmediately: boolean,
        ...rest: TRest
    ): Promise<TResult> => {
        const promise = getter(key, ...rest);
        const previousEntry = store.get(key);

        const entry: CacheEntry<TResult> = {
            promise,
            lastAccessTime: saveImmediately
                ? Date.now()
                : (previousEntry?.lastAccessTime ?? Date.now()),
        };

        if (saveImmediately) {
            evictLeastRecentlyUsedEntries();
            store.set(key, entry);
        }

        promise
            .then(() => {
                const currentEntry = store.get(key);

                if (saveImmediately) {
                    if (currentEntry && currentEntry.promise === promise) {
                        store.set(key, entry);
                        scheduleUpdate(key, entry);
                    }
                } else if (!currentEntry || currentEntry === previousEntry) {
                    evictLeastRecentlyUsedEntries();
                    store.set(key, entry);
                    scheduleUpdate(key, entry);
                }
            })
            .catch(() => {
                const currentEntry = store.get(key);
                if (saveImmediately) {
                    if (currentEntry && currentEntry.promise === promise) {
                        cleanupEntry(key);
                    }
                } else if (currentEntry === previousEntry) {
                    cleanupEntry(key);
                }
            });

        return promise;
    };

    const scheduleUpdate = (key: TKey, entry: CacheEntry<TResult>) => {
        if (entry.updateTimeoutId) {
            clearTimeout(entry.updateTimeoutId);
        }

        const timeoutId = setTimeout(() => {
            const currentEntry = store.get(key);
            if (!currentEntry || currentEntry !== entry) {
                return;
            }

            const idleTime = Date.now() - currentEntry.lastAccessTime;
            if (idleTime > MAX_IDLE_TIME) {
                cleanupEntry(key);
                return;
            }

            triggerUpdate(key, false, ...([] as unknown as TRest));
        }, cacheTime);

        if (timeoutId.unref) {
            timeoutId.unref();
        }

        entry.updateTimeoutId = timeoutId;
    };

    return (key: TKey, ...rest: TRest) => {
        const existingEntry = store.get(key);
        if (existingEntry) {
            existingEntry.lastAccessTime = Date.now();
            return existingEntry.promise;
        }

        return triggerUpdate(key, true, ...rest);
    };
}
