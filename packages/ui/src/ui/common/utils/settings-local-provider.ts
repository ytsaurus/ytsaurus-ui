import hammer from '../hammer';
import {SettingsProvider} from './settings-remote-provider';

const LOCAL_PATH = 'interface-settings';

const provider: SettingsProvider = {
    get(username: string, path: string) {
        const settingPath = LOCAL_PATH + '/' + username + '/' + path;
        return Promise.resolve(hammer.storage.read(settingPath));
    },

    set<T>(username: string, path: string, value: T) {
        const settingPath = LOCAL_PATH + '/' + username + '/' + path;
        return Promise.resolve(hammer.storage.write(settingPath, value));
    },

    remove(username: string, path: string) {
        const settingPath = LOCAL_PATH + '/' + username + '/' + path;
        return Promise.resolve(hammer.storage.remove(settingPath));
    },

    getAll<T>(username: string) {
        const settings: any = {};
        const settingSubpath = LOCAL_PATH + '/' + username + '/';

        hammer.storage.keys().forEach(function (entry: string) {
            if (entry.indexOf(settingSubpath) === 0) {
                const path = entry.substring(settingSubpath.length);
                settings[path] = hammer.storage.read(entry);
            }
        });

        return Promise.resolve(settings as T);
    },
    create() {
        return Promise.resolve();
    },
};

export default provider;
