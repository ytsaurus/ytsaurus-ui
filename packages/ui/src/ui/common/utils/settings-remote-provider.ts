import axios from 'axios';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {PromiseOrValue} from '../../../@types/types';

type Method = 'get' | 'put' | 'post' | 'delete';

interface ApiOptions {
    method: Method;
    username: string;
    path: string;
    data?: unknown;
    cluster: string;
}

function api<T>(options: ApiOptions) {
    return axios
        .request<T | undefined>({
            method: options.method,
            url: `/api/settings/${options.cluster}/${options.username}${options.path}`,
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
    get<T>(username: string, path: string, cluster: string) {
        return api<T>({method: 'get', username, path: '/' + path, cluster});
    },
    set<T>(username: string, path: string, value: T, cluster: string) {
        if (value === undefined) {
            /**
             * data-ui/core uses body-parser which interprets empty body of request as empty object {},
             * i.e. setItem from src/server/controllers/settings.js will receive req.body === {} if value === undefined,
             * so we have to remove it explicitly
             */
            return provider.remove(username, path, cluster);
        }
        return api({method: 'put', username, path: '/' + path, data: {value}, cluster});
    },
    remove(username: string, path: string, cluster: string) {
        return api({method: 'delete', username, path: '/' + path, cluster});
    },
    getAll<T>(username: string, cluster: string) {
        return api<T>({method: 'get', username, path: '/', cluster});
    },
    create(username: string, cluster: string) {
        return api({method: 'post', username, path: '/', cluster});
    },
};

export interface SettingsProvider {
    get<T>(username: string, path: string, cluster: string): Promise<T | undefined>;
    set<T>(username: string, path: string, value: T, cluster: string): Promise<void>;
    remove(username: string, path: string, cluster: string): Promise<void>;
    getAll<Data extends object>(
        username: string,
        cluster: string,
    ): PromiseOrValue<Data | undefined>;
    create(username: string, cluster: string): Promise<void>;
}

export default provider;
