import {createAutoUpdatedCache} from './auto-updated-cache';

function defer<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {promise, resolve, reject};
}

const CACHE_TIME = 2 * 0.5 * 1000;

describe('createAutoUpdatedCache', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    /**
     * Cache is empty. Three requests are done within one microtask.
     */
    it('should return single cached result if requested simultaneously', async () => {
        const deferred = defer<string>();
        const getter = jest.fn().mockReturnValueOnce(deferred.promise);

        const getPreloadedValue = createAutoUpdatedCache(getter, CACHE_TIME);
        const results = [
            getPreloadedValue('key'),
            getPreloadedValue('key'),
            getPreloadedValue('key'),
        ];

        deferred.resolve('result');

        await expect(Promise.all(results)).resolves.toEqual(['result', 'result', 'result']);

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(1);
    });

    /**
     * Cache is empty. Each request is done within its own microtask.
     */
    it('should return single cached result if following requested before first resolved', async () => {
        const deferred = defer<string>();
        const getter = jest.fn().mockReturnValueOnce(deferred.promise);

        const getPreloadedValue = createAutoUpdatedCache(getter, CACHE_TIME);

        const result1 = getPreloadedValue('key');

        const result2 = getPreloadedValue('key');

        const result3 = getPreloadedValue('key');

        deferred.resolve('result');

        await expect(Promise.all([result1, result2, result3])).resolves.toEqual([
            'result',
            'result',
            'result',
        ]);

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(1);
    });

    /**
     * Cache is empty. First requests initiates getter. Second and third requests are
     * done before getter resolves.
     */
    it('should return single cached result if following requested after first resolved', async () => {
        const deferred = defer<string>();
        const getter = jest.fn().mockReturnValueOnce(deferred.promise);

        const getPreloadedValue = createAutoUpdatedCache(getter, CACHE_TIME);

        const result1 = getPreloadedValue('key');

        deferred.resolve('result');

        const result2 = getPreloadedValue('key');

        const result3 = getPreloadedValue('key');

        await expect(Promise.all([result1, result2, result3])).resolves.toEqual([
            'result',
            'result',
            'result',
        ]);

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(1);
    });

    /**
     * First request starts requrring update task.
     * The task calls getter every CACHE_TIME ms and updates cache.
     */
    it('should update cache when cache time is over', async () => {
        const deferred1 = defer<string>();
        const deferred2 = defer<string>();
        const getter = jest
            .fn()
            .mockReturnValueOnce(deferred1.promise)
            .mockReturnValueOnce(deferred2.promise);

        const getPreloadedValue = createAutoUpdatedCache(getter, CACHE_TIME);

        expect(getter).toBeCalledTimes(0);

        const result1 = getPreloadedValue('key');

        deferred1.resolve('result1');

        await expect(result1).resolves.toEqual('result1');

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(1);

        deferred2.resolve('result2');

        await jest.advanceTimersByTimeAsync(CACHE_TIME * 1.5);

        // Trying to fetch a value right after resolve of previous request.
        // This should return updated value from cache.
        const result2 = getPreloadedValue('key');
        await expect(result2).resolves.toEqual('result2');

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(2);
    });

    /**
     * First request starts requrring update task. CACHE_TIME ms later
     * recurring updater calls getter again in order to update cache.
     * Second request is done after that but before getter promise resolves.
     * Existing cached value is to be returned.
     */
    it('should return cached result while timer based update is still awaiting response', async () => {
        const deferred1 = defer<string>();
        const deferred2 = defer<string>();
        const getter = jest
            .fn()
            .mockReturnValueOnce(deferred1.promise)
            .mockReturnValueOnce(deferred2.promise);

        const getPreloadedValue = createAutoUpdatedCache(getter, CACHE_TIME);

        const result1 = getPreloadedValue('key');

        deferred1.resolve('result1');

        await expect(result1).resolves.toEqual('result1');

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(1);

        await jest.advanceTimersByTimeAsync(CACHE_TIME);

        // Trying to fetch a value before resolve of previous request.
        // This should return existing value from cache.
        const result2 = getPreloadedValue('key');
        await expect(result2).resolves.toEqual('result1');

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(2);
    });

    /**
     * First getter call throws an error. Error is not saved into the cache.
     * Second request triggers the second getter call immediately.
     */
    it('should not keep faulty response', async () => {
        const deferred1 = defer<string>();
        const deferred2 = defer<string>();
        const getter = jest
            .fn()
            .mockReturnValueOnce(deferred1.promise)
            .mockReturnValueOnce(deferred2.promise);

        const getPreloadedValue = createAutoUpdatedCache(getter, CACHE_TIME);

        const result1 = getPreloadedValue('key');

        deferred1.reject('error1');

        await expect(result1).rejects.toEqual('error1');

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(1);

        await jest.advanceTimersByTimeAsync(1);

        // Trying to fetch a value right after rejection of previous request.
        // This should trigger new request if the previous one was not cached.
        const result2 = getPreloadedValue('key');

        deferred2.resolve('result2');

        await expect(result2).resolves.toEqual('result2');

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(2);
    });

    /**
     * Cache contains the response from first getter call. Second getter call
     * throws an error. Cache is cleared.
     */
    it('should clear cache if time based update fails', async () => {
        const deferred1 = defer<string>();
        const deferred2 = defer<string>();
        const deferred3 = defer<string>();
        const getter = jest
            .fn()
            .mockReturnValueOnce(deferred1.promise)
            .mockReturnValueOnce(deferred2.promise)
            .mockReturnValueOnce(deferred3.promise);

        const getPreloadedValue = createAutoUpdatedCache(getter, CACHE_TIME);

        const result1 = getPreloadedValue('key');

        deferred1.resolve('result1');

        await expect(result1).resolves.toEqual('result1');

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(1);

        await jest.advanceTimersByTimeAsync(CACHE_TIME);

        deferred2.reject('error2');

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(2);
        expect(getter).toHaveLastReturnedWith(deferred2.promise);

        await jest.advanceTimersByTimeAsync(1);

        // Trying to fetch a value right after rejection of previous request.
        // This should trigger new request if the previous one was not cached.
        const result3 = getPreloadedValue('key');

        deferred3.resolve('result3');

        await expect(result3).resolves.toEqual('result3');

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(3);
    });

    /**
     * First getter call throws an error. Recurring updates are not started.
     */
    it('should not start recurring updates if first response is faulty', async () => {
        const deferred1 = defer<string>();
        const deferred2 = defer<string>();
        const getter = jest
            .fn()
            .mockReturnValueOnce(deferred1.promise)
            .mockReturnValueOnce(deferred2.promise);

        const getPreloadedValue = createAutoUpdatedCache(getter, CACHE_TIME);

        const result1 = getPreloadedValue('key');

        deferred1.reject('error1');

        await expect(result1).rejects.toEqual('error1');

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(1);

        await jest.advanceTimersByTimeAsync(3 * CACHE_TIME);

        expect(getter).toBeCalledTimes(1);
    });

    /**
     * Cache contains the response from first getter call. Second getter call
     * throws an error. Recurring updates are stopped.
     */
    it('should stop recurring updates if time based update fails', async () => {
        const deferred1 = defer<string>();
        const deferred2 = defer<string>();
        const deferred3 = defer<string>();
        const getter = jest
            .fn()
            .mockReturnValueOnce(deferred1.promise)
            .mockReturnValueOnce(deferred2.promise)
            .mockReturnValueOnce(deferred3.promise);

        const getPreloadedValue = createAutoUpdatedCache(getter, CACHE_TIME);

        const result1 = getPreloadedValue('key');

        deferred1.resolve('result1');

        await expect(result1).resolves.toEqual('result1');

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(1);

        await jest.advanceTimersByTimeAsync(CACHE_TIME);

        deferred2.reject('error2');

        expect(getter).lastCalledWith('key');
        expect(getter).toBeCalledTimes(2);

        await jest.advanceTimersByTimeAsync(3 * CACHE_TIME);

        expect(getter).toBeCalledTimes(2);
    });

    /**
     * First request is done with key1, response is saved into the cache.
     * Second request is done with key2, response to the first request is ignored.
     */
    it('should respect cache key', async () => {
        const getter = jest.fn().mockResolvedValueOnce('result1').mockResolvedValueOnce('result2');

        const getPreloadedValue = createAutoUpdatedCache(getter, CACHE_TIME);

        const result1 = getPreloadedValue('key1');

        await expect(result1).resolves.toEqual('result1');

        expect(getter).lastCalledWith('key1');
        expect(getter).toBeCalledTimes(1);

        const result2 = getPreloadedValue('key2');

        await expect(result2).resolves.toEqual('result2');

        expect(getter).lastCalledWith('key2');
        expect(getter).toBeCalledTimes(2);
    });

    /**
     * Second request is done with the same key as first request, but with different
     * rest parameters. First response is returned to the second request.
     */
    it('should pass rest parameters but disregard them for caching purpose', async () => {
        const getter = jest.fn().mockResolvedValueOnce('result1').mockResolvedValueOnce('result2');

        const getPreloadedValue = createAutoUpdatedCache(getter, CACHE_TIME);

        const result1 = getPreloadedValue('key', 'rest1');

        await expect(result1).resolves.toEqual('result1');

        expect(getter).lastCalledWith('key', 'rest1');
        expect(getter).toBeCalledTimes(1);

        const result2 = getPreloadedValue('key', 'rest2');

        await expect(result2).resolves.toEqual('result1');

        expect(getter).toBeCalledTimes(1);
    });
});
