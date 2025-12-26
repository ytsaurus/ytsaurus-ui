const delay = (ms: number) =>
    new Promise((resolve) => {
        const timeout = setTimeout(resolve, ms);
        timeout.unref();
    });

const CACHE_TIME = 2 * 60 * 1000;

export function createAutoUpdatedCache<TKey extends string | number, TRest extends any[], TResult>(
    getter: (key: TKey, ...rest: TRest) => Promise<TResult>,
    cacheTime: number = CACHE_TIME,
) {
    const store = new Map<TKey, ReturnType<typeof getter>>();

    function triggerUpdate(key: TKey, saveImmediately: boolean, ...rest: TRest) {
        const promise = getter(key, ...rest);
        if (saveImmediately) {
            store.set(key, promise);
        }

        promise
            .then(() => {
                store.set(key, promise);
            })
            .then(() => delay(cacheTime))
            .then(() => {
                if (store.get(key) !== promise) return;
                return triggerUpdate(key, false, ...rest);
            })
            .catch(() => {
                if (store.get(key) !== promise) return;
                store.delete(key);
            });

        return promise;
    }

    return function getPreloadedResult(key: TKey, ...rest: TRest) {
        if (!store.has(key)) {
            triggerUpdate(key, true, ...rest);
        }

        return store.get(key)!;
    };
}
