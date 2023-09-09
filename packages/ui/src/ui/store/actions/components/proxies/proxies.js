import _ from 'lodash';
import axios from 'axios';
import ypath from '../../../../common/thor/ypath';

import Proxy from '../../../../store/reducers/components/proxies/proxies/proxy';
import {
    GET_PROXIES,
    PROXIES_CHANGE_FILTERS,
    PROXY_TYPE,
} from '../../../../constants/components/proxies/proxies';
import {getCluster} from '../../../../store/selectors/global';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';

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
                const proxies = _.map(data, (proxyData) => {
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
                const proxies = _.map(data, (proxyData) => {
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

/**
 *
 * @param {'http' | 'rpc'} type
 * @returns
 */
export function getProxies(type) {
    return (dispatch) => {
        dispatch({type: GET_PROXIES.REQUEST});

        return dispatch(type === PROXY_TYPE.HTTP ? getHttpProxies() : getRpcProxies());
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
