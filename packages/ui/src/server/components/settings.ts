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

function getSettingsSetup() {
    return getRobotYTApiSetup(getSettingsConfig().cluster!).setup;
}

export function isRemoteSettingsConfigured() {
    const {userSettingsConfig} = getApp().config;
    return Boolean(userSettingsConfig);
}

interface Params {
    ctx: AppContext;
    username: string;
}

export function create({ctx, username}: Params) {
    ctx.log('settings.create', {username});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.create({
        setup: getSettingsSetup(),
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

export function get({ctx, username}: Params) {
    ctx.log('settings.get', {username});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.get({
        setup: getSettingsSetup(),
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
export function getItem({ctx, username, path}: GetParams) {
    ctx.log('settings.getItem', {username, path});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.get({
        setup: getSettingsSetup(),
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
export function setItem({ctx, username, path, value}: SetParams) {
    ctx.log('settings.setItem', {username, path, value});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.set({
        setup: getSettingsSetup(),
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
export function deleteItem({ctx, username, path}: GetParams) {
    ctx.log('settings.deleteItem', {username, path});
    if (!isRemoteSettingsConfigured()) {
        return Promise.reject(makeConfigError());
    }

    return yt.v3.remove({
        setup: getSettingsSetup(),
        parameters: {
            path: getSettingsConfig().mapNodePath + '/' + username + '/' + path,
        },
    });
}
