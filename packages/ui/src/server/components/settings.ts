import {AppContext} from '@gravity-ui/nodekit';
import {getApp} from '../ServerFactory';
import {getRobotYTApiSetup} from './requestsSetup';

const yt = require('@ytsaurus/javascript-wrapper')();

function makeConfigError() {
    return new Error('Remote user settings are not configured. Please provide userSettingsConfig.');
}

export function getSettingsConfig(cluster: string): {
    cluster: string;
    mapNodePath?: string;
} {
    const {userSettingsConfig} = getApp().config;

    return {
        cluster,
        ...userSettingsConfig,
    };
}

function getSettingsSetup(cluster: string) {
    return getRobotYTApiSetup(getSettingsConfig(cluster).cluster).setup;
}

export function isRemoteSettingsConfigured() {
    const {userSettingsConfig} = getApp().config;
    return Boolean(userSettingsConfig);
}

interface Params {
    ctx: AppContext;
    username: string;
    cluster: string;
}

export function create({ctx, username, cluster}: Params) {
    ctx.log('settings.create', {username});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.create({
        setup: getSettingsSetup(cluster),
        parameters: {
            path: getSettingsConfig(cluster).mapNodePath + '/' + username,
            type: 'document',
            ignore_existing: true, // No error if exists
            attributes: {
                value: {},
            },
        },
    });
}

export function get({ctx, username, cluster}: Params) {
    ctx.log('settings.get', {username, cluster});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.get({
        setup: getSettingsSetup(cluster),
        parameters: {
            path: getSettingsConfig(cluster).mapNodePath + '/' + username,
            output_format: {
                $value: 'json',
                $attributes: {
                    encode_utf8: 'false',
                },
            },
        },
    });
}

interface GetParams extends Params {
    path: string;
}
export function getItem({ctx, username, path, cluster}: GetParams) {
    ctx.log('settings.getItem', {username, path});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    console.log(' getSettingsSetup(cluster),', getSettingsSetup(cluster));
    return yt.v3.get({
        setup: getSettingsSetup(cluster),
        parameters: {
            path: getSettingsConfig(cluster).mapNodePath + '/' + username + '/' + path,
            output_format: {
                $value: 'json',
                $attributes: {
                    encode_utf8: 'false',
                },
            },
        },
    });
}

interface SetParams extends GetParams {
    value: any;
}
export function setItem({ctx, username, path, value, cluster}: SetParams) {
    ctx.log('settings.setItem', {username, path, value, cluster});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.set({
        setup: getSettingsSetup(cluster),
        parameters: {
            path: getSettingsConfig(cluster).mapNodePath + '/' + username + '/' + path,
            input_format: {
                $value: 'json',
                $attributes: {
                    encode_utf8: 'false',
                },
            },
        },
        data: value,
    });
}
export function deleteItem({ctx, username, path, cluster}: GetParams) {
    ctx.log('settings.deleteItem', {username, path, cluster});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.remove({
        setup: getSettingsSetup(cluster),
        parameters: {
            path: getSettingsConfig(cluster).mapNodePath + '/' + username + '/' + path,
        },
    });
}
