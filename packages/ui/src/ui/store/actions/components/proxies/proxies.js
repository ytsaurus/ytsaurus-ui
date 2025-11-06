import map_ from 'lodash/map';

import axios from 'axios';
import ypath from '../../../../common/thor/ypath';
import format from '../../../../common/hammer/format';

import Proxy from '../../../../store/reducers/components/proxies/proxies/proxy';
import {
    GET_PROXIES,
    PROXIES_CHANGE_FILTERS,
    PROXY_TYPE,
} from '../../../../constants/components/proxies/proxies';
import {getCluster} from '../../../../store/selectors/global';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {YTErrors} from '../../../../rum/constants';

function getRpcProxies() {
    return (dispatch) => {
        return Promise.all([
            ytApiV3Id.list(YTApiId.componentsRpcProxies, {
                path: '//sys/rpc_proxies',
                attributes: Proxy.ATTRIBUTES,
            }),
            ytApiV3Id.get(YTApiId.componentGetRpcProxies, {path: '//sys/rpc_proxies'}),
        ])
            .then(([data, proxiesMap]) => {
                const proxies = map_(data, (proxyData) => {
                    const name = ypath.getValue(proxyData);
                    const role = ypath.getValue(proxyData, '/role') || 'default';
                    const alive = Boolean(ypath.getValue(proxiesMap, `/${name}`).alive);
                    const attributes = ypath.getAttributes(proxyData);
                    const meta = {name, role, dead: !alive};

                    return new Proxy({...meta, ...attributes});
                });

                dispatch({
                    type: GET_PROXIES.SUCCESS,
                    data: {proxies},
                });
            })
            .catch((error) => {
                dispatch({
                    type: GET_PROXIES.FAILURE,
                    data: {error},
                });
            });
    };
}

function getHttpProxies() {
    return (dispatch, getState) => {
        const cluster = getCluster(getState());
        return Promise.all([
            axios.get(`/api/yt-proxy/${cluster}/hosts-all`),
            ytApiV3Id.get(YTApiId.systemProxies, {
                path: '//sys/http_proxies',
                attributes: Proxy.ATTRIBUTES,
            }),
        ])
            .then(([{data}, cypressData]) => {
                const proxies = map_(data, (proxyData) => {
                    const cypressAttributes = ypath.getAttributes(
                        ypath.getValue(cypressData)[proxyData.name],
                    );

                    return new Proxy({...proxyData, ...cypressAttributes});
                });

                dispatch({
                    type: GET_PROXIES.SUCCESS,
                    data: {proxies},
                });
            })
            .catch((error) => {
                dispatch({
                    type: GET_PROXIES.FAILURE,
                    data: {error},
                });
            });
    };
}

function getCypressProxies() {
    return async (dispatch) => {
        try {
            const cypressData = await ytApiV3Id.list(YTApiId.componentGetCypressProxies, {
                path: '//sys/cypress_proxies',
                attributes: ['state', 'version'],
            });

            const proxies = map_(cypressData, (proxyData) => {
                const name = ypath.getValue(proxyData);
                const state = ypath.getAttributes(proxyData)?.state || format.NO_VALUE;
                const version = ypath.getAttributes(proxyData)?.version || format.NO_VALUE;

                return new Proxy({...proxyData, ...{name, state, version}});
            });

            dispatch({
                type: GET_PROXIES.SUCCESS,
                data: {proxies},
            });
        } catch (error) {
            if (error?.code === YTErrors.NODE_DOES_NOT_EXIST) {
                dispatch({
                    type: GET_PROXIES.SUCCESS,
                    data: {proxies: []},
                });
                return;
            }
            dispatch({
                type: GET_PROXIES.FAILURE,
                data: {error},
            });
        }
    };
}

/**
 *
 * @param {'http' | 'rpc' | 'cypress'} type
 * @returns
 */
export function getProxies(type) {
    return (dispatch) => {
        dispatch({type: GET_PROXIES.REQUEST});

        switch (type) {
            case PROXY_TYPE.HTTP:
                return dispatch(getHttpProxies());
            case PROXY_TYPE.RPC:
                return dispatch(getRpcProxies());
            case PROXY_TYPE.CYPRESS:
                return dispatch(getCypressProxies());
        }
    };
}

export function changeHostFilter(hostFilter) {
    return {
        type: PROXIES_CHANGE_FILTERS,
        data: {hostFilter},
    };
}

export function changeStateFilter(stateFilter) {
    return {
        type: PROXIES_CHANGE_FILTERS,
        data: {stateFilter},
    };
}

export function changeRoleFilter(roleFilter) {
    return {
        type: PROXIES_CHANGE_FILTERS,
        data: {roleFilter},
    };
}

export function changeBannedFilter(bannedFilter) {
    return {type: PROXIES_CHANGE_FILTERS, data: {bannedFilter}};
}

export function resetProxyState() {
    return (dispatch) => {
        dispatch({type: GET_PROXIES.CANCELLED});
    };
}
