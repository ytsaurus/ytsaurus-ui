import {USE_CACHE, disableYTCacheTemporarily} from './yt-api';

describe('temporary YT cache bypass', () => {
    const values = new Map<string, string>();

    beforeEach(() => {
        values.clear();
        Object.defineProperty(globalThis, 'localStorage', {
            configurable: true,
            value: {
                getItem: (key: string) => values.get(key) ?? null,
                setItem: (key: string, value: string) => values.set(key, value),
            },
        });
        jest.useFakeTimers({now: 100_000});
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('uses the cache normally and resumes at the deadline', () => {
        const cached = {read_from: 'cache', disable_per_user_cache: true};

        expect(USE_CACHE()).toEqual(cached);

        disableYTCacheTemporarily();

        expect(USE_CACHE()).toEqual({});

        jest.advanceTimersByTime(14_999);
        expect(USE_CACHE()).toEqual({});

        jest.advanceTimersByTime(1);
        expect(USE_CACHE()).toEqual(cached);
    });

    it('extends the deadline after another write', () => {
        disableYTCacheTemporarily();

        jest.advanceTimersByTime(10_000);
        disableYTCacheTemporarily();

        jest.advanceTimersByTime(14_999);
        expect(USE_CACHE()).toEqual({});

        jest.advanceTimersByTime(1);
        expect(USE_CACHE()).toEqual({read_from: 'cache', disable_per_user_cache: true});
    });
});
