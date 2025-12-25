import Cookies from 'js-cookie';
// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {getWindowStore} from '../store/window-store';
import {getClusterConfig, getXsrfCookieName} from '../utils';
import {BAN_USER, BLOCK_USER} from '../constants/index';
import {YT} from '../config/yt-config';
import {getClusterProxy} from '../store/selectors/global';
import {getConfigData} from '../config/ui-settings';
import unipika from '../common/thor/unipika';
import {toaster} from '../utils/toaster';

export function initYTApiClusterParams(cluster: string) {
    const {clusters} = YT;
    const config = getClusterConfig(clusters, cluster);

    yt.setup.setGlobalOption('suppressAccessTracking', true);
    yt.setup.setGlobalOption('useEncodedParameters', true);
    yt.setup.setGlobalOption('proxy', getClusterProxy(config));

    const allowYtTvm = !getConfigData().ytApiUseCORS;

    if (allowYtTvm) {
        config.secure = window.location.protocol === 'https:';
    }

    yt.setup.setGlobalOption('useHeavyProxy', false);

    yt.setup.setGlobalOption('xsrf', true);
    yt.setup.setGlobalOption('xsrfCookieName', getXsrfCookieName(config.id));

    if (typeof config.secure === 'boolean') {
        yt.setup.setGlobalOption('secure', config.secure);
    } else {
        yt.setup.setGlobalOption('secure', true);
    }

    yt.setup.setGlobalOption('authentication', {type: config.authentication || 'none'});

    yt.subscribe('error', onError);
}

function onError(error: any) {
    const code = error && error.code;

    if (code === yt.codes.USER_IS_BANNED) {
        getWindowStore().dispatch({type: BAN_USER});
    } else if (code === yt.codes.USER_EXCEEDED_RPS) {
        getWindowStore().dispatch({type: BLOCK_USER});
    } else if (code == yt.codes.XSRF_TOKEN_EXPIRED) {
        const content = `Your CSRF-token '${getToken()}' has expired. Please reaload the page`;
        console.log(content);

        toaster.add({
            name: 'xsrf-expired',
            theme: 'info',
            autoHiding: false,
            title: 'CSRF-toke expired',
            content: content,
        });
    }
}

function getToken() {
    const cluster = YT.cluster;
    const tokenName = cluster && getXsrfCookieName(cluster);
    return tokenName && Cookies.get(tokenName);
}

export const secureDecoding = (value: string) => {
    try {
        return unipika.decode(value);
    } catch (e) {
        return value;
    }
};

export const JSONSerializer = {
    stringify(data: unknown) {
        return JSON.stringify(data);
    },
    parse(data: string) {
        return JSON.parse(data, (_, value) => {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                return Object.keys(value).reduce<Record<any, any>>((acc, k) => {
                    acc[secureDecoding(k)] =
                        typeof value[k] === 'string' ? secureDecoding(value[k]) : value[k];

                    return acc;
                }, {});
            }

            return value;
        });
    },
};
