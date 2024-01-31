import axios from 'axios';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

type Method = 'get' | 'put' | 'post' | 'delete';

interface ApiOptions {
    method: Method;
    username: string;
    path: string;
    data?: unknown;
    ytAuthCluster: string;
}

function api<T>(options: ApiOptions) {
    return axios
        .request<T | undefined>({
            method: options.method,
            url: `/api/settings/${options.ytAuthCluster}/${options.username}${options.path}`,
            headers: {
                'content-type': 'application/json',
            },
            data: JSON.stringify(options.data),
        })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            if (!error.response) {
                return Promise.reject({
                    code: 0,
                    message: 'Network error',
                });
            }

            const {data} = error.response;
            if (data.code === yt.codes.NODE_DOES_NOT_EXIST) {
                return undefined;
            }

            return Promise.reject(data);
        });
}

const provider: SettingsProvider = {
    get<T>(username: string, path: string, ytAuthCluster: string) {
        return api<T>({method: 'get', username, path: '/' + path, ytAuthCluster});
    },
    set<T>(username: string, path: string, value: T, ytAuthCluster: string) {
        if (value === undefined) {
            /**
             * data-ui/core uses body-parser which interprets empty body of request as empty object {},
             * i.e. setItem from src/server/controllers/settings.js will receive req.body === {} if value === undefined,
             * so we have to remove it explicitly
             */
            return provider.remove(username, path, ytAuthCluster);
        }
        return api({method: 'put', username, path: '/' + path, data: {value}, ytAuthCluster});
    },
    remove(username: string, path: string, ytAuthCluster: string) {
        return api({method: 'delete', username, path: '/' + path, ytAuthCluster});
    },
    getAll<T>(username: string, ytAuthCluster: string) {
        return api<T>({method: 'get', username, path: '/', ytAuthCluster});
    },
    create(username: string, ytAuthCluster: string) {
        return api({method: 'post', username, path: '/', ytAuthCluster});
    },
};

export interface SettingsProvider {
    get<T>(username: string, path: string, ytAuthCluster: string): Promise<T | undefined>;
    set<T>(username: string, path: string, value: T, ytAuthCluster: string): Promise<void>;
    remove(username: string, path: string, ytAuthCluster: string): Promise<void>;
    getAll<Data extends object>(username: string, ytAuthCluster: string): Promise<Data | undefined>;
    create(username: string, ytAuthCluster: string): Promise<void>;
}

export default provider;
