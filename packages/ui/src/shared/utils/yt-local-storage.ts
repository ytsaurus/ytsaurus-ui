import merge_ from 'lodash/merge';

export interface YTStorageData {
    ytCacheDisabledUntil: number;
    loginDialog: {
        username?: string;
    };
}

function storageKey(key: string) {
    return `yt_${key}`;
}

class YTLocalStorage {
    onError?: (method: 'get' | 'set', key: keyof YTStorageData, error: unknown) => void;

    private fallback: Partial<YTStorageData> = {};

    get<K extends keyof YTStorageData>(k: K): undefined | Partial<YTStorageData[K]> {
        if (Object.prototype.hasOwnProperty.call(this.fallback, k)) {
            return this.fallback[k];
        }
        try {
            const rawValue = localStorage.getItem(storageKey(k));
            return rawValue !== null && rawValue !== undefined ? JSON.parse(rawValue) : undefined;
        } catch (error) {
            this.onError?.('get', k, error);
            return undefined;
        }
    }

    set<K extends keyof YTStorageData, V extends YTStorageData[K]>(k: K, v: V) {
        try {
            localStorage.setItem(storageKey(k), JSON.stringify(v));
            delete this.fallback[k];
        } catch (error) {
            this.fallback[k] = v;
            this.onError?.('set', k, error);
        }
    }

    merge<K extends keyof YTStorageData, V extends YTStorageData[K]>(k: K, v: Partial<V>) {
        this.set(k, merge_(this.get(k), v) as V);
    }
}

export default new YTLocalStorage();
