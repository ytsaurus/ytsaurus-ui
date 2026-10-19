import ytLocalStorage from './yt-local-storage';

describe('ytLocalStorage', () => {
    const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    const values = new Map<string, string>();
    const storage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
    };

    beforeEach(() => {
        values.clear();
        storage.getItem.mockImplementation((key: string) => values.get(key) ?? null);
        storage.setItem.mockImplementation((key: string, value: string) => {
            values.set(key, value);
        });
        Object.defineProperty(globalThis, 'localStorage', {configurable: true, value: storage});
        ytLocalStorage.set('ytCacheDisabledUntil', 0);
        ytLocalStorage.set('loginDialog', {});
        values.clear();
    });

    afterAll(() => {
        if (originalStorage) {
            Object.defineProperty(globalThis, 'localStorage', originalStorage);
        } else {
            Reflect.deleteProperty(globalThis, 'localStorage');
        }
    });

    it('reads stored values and observes external updates', () => {
        expect(ytLocalStorage.get('loginDialog')).toBeUndefined();
        ytLocalStorage.set('loginDialog', {username: 'alice'});
        expect(ytLocalStorage.get('loginDialog')).toEqual({username: 'alice'});
        values.set('yt_loginDialog', '{"username":"bob"}');
        expect(ytLocalStorage.get('loginDialog')).toEqual({username: 'bob'});
    });

    it('prefers failed writes, including zero, until a successful write clears the fallback', () => {
        ytLocalStorage.set('ytCacheDisabledUntil', 100);
        storage.setItem.mockImplementationOnce(() => {
            throw new Error('Storage unavailable');
        });
        ytLocalStorage.set('ytCacheDisabledUntil', 0);
        expect(ytLocalStorage.get('ytCacheDisabledUntil')).toBe(0);

        storage.setItem.mockImplementationOnce(() => {
            throw new Error('Storage unavailable');
        });
        ytLocalStorage.set('ytCacheDisabledUntil', 200);
        expect(ytLocalStorage.get('ytCacheDisabledUntil')).toBe(200);

        ytLocalStorage.set('ytCacheDisabledUntil', 300);
        values.set('yt_ytCacheDisabledUntil', '400');
        expect(ytLocalStorage.get('ytCacheDisabledUntil')).toBe(400);
    });

    it('returns undefined when reading or parsing storage fails', () => {
        storage.getItem.mockImplementationOnce(() => {
            throw new Error('Storage unavailable');
        });
        expect(ytLocalStorage.get('loginDialog')).toBeUndefined();
        values.set('yt_loginDialog', 'invalid json');
        expect(ytLocalStorage.get('loginDialog')).toBeUndefined();
    });

    it('merges through the fallback and persists it when storage recovers', () => {
        storage.setItem.mockImplementationOnce(() => {
            throw new Error('Storage unavailable');
        });
        ytLocalStorage.merge('loginDialog', {username: 'alice'});
        expect(ytLocalStorage.get('loginDialog')).toEqual({username: 'alice'});
        ytLocalStorage.merge('loginDialog', {});
        expect(values.get('yt_loginDialog')).toBe('{"username":"alice"}');
        values.set('yt_loginDialog', '{"username":"bob"}');
        expect(ytLocalStorage.get('loginDialog')).toEqual({username: 'bob'});
    });
});
