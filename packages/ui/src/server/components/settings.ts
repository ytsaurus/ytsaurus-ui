import {AppContext} from '@gravity-ui/nodekit';
import {YTCoreConfig} from '../../@types/core';
import {getApp} from '../ServerFactory';
import {getRobotYTApiSetup} from './requestsSetup';

const yt = require('@ytsaurus/javascript-wrapper')();

function makeConfigError() {
    return new Error('Remote user settings are not configured. Please provide userSettingsConfig.');
}

function getSettingsConfig(): Partial<Required<YTCoreConfig>['userSettingsConfig']> {
    const {userSettingsConfig} = getApp().config;
    return userSettingsConfig || {};
}

function getSettingsSetup(ytAuthCluster: string) {
    return getRobotYTApiSetup(ytAuthCluster).setup;
}

export function isRemoteSettingsConfigured() {
    const {userSettingsConfig} = getApp().config;
    return Boolean(userSettingsConfig);
}

interface Params {
    ctx: AppContext;
    username: string;
    ytAuthCluster: string;
}

export function create({ctx, username, ytAuthCluster}: Params) {
    ctx.log('settings.create', {username});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.create({
        setup: getSettingsSetup(ytAuthCluster),
        parameters: {
            path: getSettingsConfig().mapNodePath + '/' + username,
            type: 'document',
            ignore_existing: true, // No error if exists
            attributes: {
                value: {},
            },
        },
    });
}

export function get({ctx, username, ytAuthCluster}: Params) {
    ctx.log('settings.get', {username, ytAuthCluster});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.get({
        setup: getSettingsSetup(ytAuthCluster),
        parameters: {
            path: getSettingsConfig().mapNodePath + '/' + username,
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
export function getItem({ctx, username, path, ytAuthCluster}: GetParams) {
    ctx.log('settings.getItem', {username, path});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.get({
        setup: getSettingsSetup(ytAuthCluster),
        parameters: {
            path: getSettingsConfig().mapNodePath + '/' + username + '/' + path,
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
export function setItem({ctx, username, path, value, ytAuthCluster}: SetParams) {
    ctx.log('settings.setItem', {username, path, value, ytAuthCluster});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.set({
        setup: getSettingsSetup(ytAuthCluster),
        parameters: {
            path: getSettingsConfig().mapNodePath + '/' + username + '/' + path,
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
export function deleteItem({ctx, username, path, ytAuthCluster}: GetParams) {
    ctx.log('settings.deleteItem', {username, path, ytAuthCluster});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.remove({
        setup: getSettingsSetup(ytAuthCluster),
        parameters: {
            path: getSettingsConfig().mapNodePath + '/' + username + '/' + path,
        },
    });
}
