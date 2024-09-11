import merge_ from 'lodash/merge';

export interface YTStorageData {
    loginDialog: {
        username?: string;
    };
}

function storageKey(key: string) {
    return `yt_${key}`;
}

class YTLocalStorage {
    get<K extends keyof YTStorageData>(k: K): undefined | Partial<YTStorageData[K]> {
        try {
            const rawValue = localStorage.getItem(storageKey(k));
            return rawValue !== null && rawValue !== undefined ? JSON.parse(rawValue) : undefined;
        } catch {
            return undefined;
        }
    }

    set<K extends keyof YTStorageData, V extends YTStorageData[K]>(k: K, v: V) {
        localStorage.setItem(storageKey(k), JSON.stringify(v));
    }

    merge<K extends keyof YTStorageData, V extends YTStorageData[K]>(k: K, v: Partial<V>) {
        localStorage.setItem(storageKey(k), JSON.stringify(merge_(this.get(k), v)));
    }
}

export default new YTLocalStorage();
