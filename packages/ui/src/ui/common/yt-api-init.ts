import Cookies from 'js-cookie';
// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {Toaster} from '@gravity-ui/uikit';

import {getWindowStore} from '../store/window-store';
import {getXsrfCookieName, getClusterConfig} from '../utils';
import {ytApiUseCORS} from '../config/index';
import {isSupportedYtTvmAPIGlobal} from '../store/selectors/thor/support';
import {BLOCK_USER, BAN_USER} from '../constants/index';
import YT from '../config/yt-config';

export function initYTApiClusterParams(cluster: string) {
    const {clusters} = YT;
    const config = getClusterConfig(clusters, cluster);

    yt.setup.setGlobalOption('suppressAccessTracking', true);
    yt.setup.setGlobalOption('useEncodedParameters', true);

    const allowYtTvmApi = !ytApiUseCORS() && isSupportedYtTvmAPIGlobal();
    const isSecureLocation = window.location.protocol === 'https:';

    if (allowYtTvmApi) {
        yt.setup.setGlobalOption('proxy', `${window.location.host}/api/yt/${config.id}`);
        config.secure = isSecureLocation;
    } else {
        yt.setup.setGlobalOption('proxy', config.proxy);
    }

    yt.setup.setGlobalOption('useHeavyProxy', false);

    yt.setup.setGlobalOption('xsrf', true);
    yt.setup.setGlobalOption('xsrfCookieName', getXsrfCookieName(config.id));

    if (typeof config.secure === 'boolean') {
        yt.setup.setGlobalOption('secure', config.secure);
    } else {
        yt.setup.setGlobalOption('secure', true);
    }

    if (config.authentication === 'domain') {
        yt.setup.setGlobalOption('authentication', {type: 'domain'});
    }

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

        new Toaster().add({
            name: 'xsrf-expired',
            type: 'info',
            allowAutoHiding: false,
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
