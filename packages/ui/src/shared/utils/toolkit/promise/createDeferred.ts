/**
 * Creates a promise with externally accessible resolve and reject functions.
 * Useful for controlling when an asynchronous operation completes, for example in tests.
 *
 * @example
 * ```ts
 * const deferred = createDeferred<string>();
 * deferred.resolve('result');
 * const result = await deferred.promise; // 'result'
 * ```
 *
 * @returns The promise and functions to resolve or reject it.
 */
export const createDeferred = <T = void>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return {promise, resolve, reject};
};
