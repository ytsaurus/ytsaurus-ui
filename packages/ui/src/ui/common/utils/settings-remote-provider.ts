import axios from 'axios';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {PromiseOrValue} from '../../../@types/types';

type Method = 'get' | 'put' | 'post' | 'delete';

function api<T>(method: Method, username: string, path: string, data?: unknown) {
    return axios
        .request<T | undefined>({
            method: method,
            url: '/api/settings/' + username + path,
            headers: {
                'content-type': 'application/json',
            },
            data: JSON.stringify(data),
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
    get<T>(username: string, path: string) {
        return api<T>('get', username, '/' + path);
    },
    set<T>(username: string, path: string, value: T) {
        if (value === undefined) {
            /**
             * data-ui/core uses body-parser which interprets empty body of request as empty object {},
             * i.e. setItem from src/server/controllers/settings.js will receive req.body === {} if value === undefined,
             * so we have to remove it explicitly
             */
            return provider.remove(username, path);
        }
        return api('put', username, '/' + path, {value});
    },
    remove(username: string, path: string) {
        return api('delete', username, '/' + path);
    },
    getAll<T>(username: string) {
        return api<T>('get', username, '/');
    },
    create(username: string) {
        return api('post', username, '/');
    },
};

export interface SettingsProvider {
    get<T>(username: string, path: string): Promise<T | undefined>;
    set<T>(username: string, path: string, value: T): Promise<void>;
    remove(username: string, path: string): Promise<void>;
    getAll<Data extends object>(username: string): PromiseOrValue<Data | undefined>;
    create(username: string): Promise<void>;
}

export default provider;
