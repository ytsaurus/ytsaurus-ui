import {renderApp} from '../render-app';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import axios from 'axios';
import {handleAuthError} from '../store/actions/global';
import {YT_UI_CLUSTER_HEADER_NAME} from '../../shared/constants';
import './main.scss';
import {defaultUIFactory} from '../UIFactory/default-ui-factory';

yt.subscribe('error', onError);
axios.interceptors.response.use(undefined, onAxiosError);

renderApp(defaultUIFactory);

function onAxiosError(e: any) {
    onError(e);
    return Promise.reject(e);
}

function onError(e: any) {
    const isAuthError = axios.isAxiosError(e) && e.response?.status === 401;

    if (isAuthError) {
        handleAuthError({
            ytAuthCluster: e.response?.headers[YT_UI_CLUSTER_HEADER_NAME],
        });
    }
}
