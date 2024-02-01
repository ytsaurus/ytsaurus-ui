import {renderApp} from '../render-app';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import axios from 'axios';
import {handleAuthError} from '../store/actions/global';
import './main.scss';

yt.subscribe('error', onError);
axios.interceptors.response.use(undefined, onAxiosError);

renderApp({});

function onAxiosError(e: any) {
    onError(e);
    return Promise.reject(e);
}

function onError(e: any) {
    const isAuthError = axios.isAxiosError(e) && e.response?.status === 401;
    if (isAuthError) {
        handleAuthError({ytAuthCluster: e?.response?.data?.extraData?.ytAuthCluster});
    }
}
