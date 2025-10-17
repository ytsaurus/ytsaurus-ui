import {ThunkAction, UnknownAction} from '@reduxjs/toolkit';

import {Toaster} from '@gravity-ui/uikit';

import {USE_SUPRESS_SYNC} from '../../../../shared/constants';
import ypath from '../../../common/thor/ypath';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {RootState} from '../../../store/reducers';
import {RoleGroupItemInfo} from '../../../store/reducers/system/proxies';
import {isRetryFutile} from '../../../utils/index';
import {extractProxyCounters, extractRoleGroups} from '../../../utils/system/proxies';
import {showErrorPopup} from '../../../utils/utils';
import {fetchCypressProxiesRequest, fetchCypressProxiesSuccess, fetchCypressProxiesFailure} from '../../../store/reducers/system/cypress-proxies';

type CypressProxiesThunkAction<T = void> = ThunkAction<
    Promise<T>,
    RootState,
    unknown,
    UnknownAction
>;

function extractCypressProxy(data: object): Array<RoleGroupItemInfo> {
    const cypressProxies = ypath.getValue(data);
    const result = [];
    for (const proxy in cypressProxies) {
        const proxyData = ypath.getAttributes(cypressProxies[proxy]);
        const state = ypath.getValue(proxyData, '/state');
        const effectiveState = state ? 'online' as const : 'offline' as const;
        const banned = ypath.getValue(proxyData, '/@banned');
        result.push({
            name: proxy,
            role: ypath.getValue(proxyData, '/@role'),
            state,
            effectiveState,
            banned,
        }); 
    }
    return result;
}

export function loadSystemCypressProxies(): CypressProxiesThunkAction<
    undefined | {isRetryFutile: boolean}
> {
    return (dispatch) => {
        dispatch(fetchCypressProxiesRequest());

        return ytApiV3Id
            .get(YTApiId.systemCypressProxies, {
                path: '//sys/cypress_proxies',
                attributes: ['role', 'banned', 'state'],
                ...USE_SUPRESS_SYNC,
            })
            .then((data = []) => {
                const cypressProxies = extractCypressProxy(data);

                dispatch(fetchCypressProxiesSuccess({
                    roleGroups: extractRoleGroups(cypressProxies),
                    counters: extractProxyCounters(cypressProxies),
                }));
                return undefined;
            })
            .catch((error) => {
                dispatch(fetchCypressProxiesFailure(error));

                const data = error?.response?.data || error;
                const {code, message} = data;

                const toaster = new Toaster();
                toaster.add({
                    name: 'load/system/cypress-proxies',
                    autoHiding: false,
                    theme: 'danger',
                    content: `[code ${code}] ${message}`,
                    title: 'Could not load Cypress-Proxies',
                    actions: [
                        {
                            label: ' view',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });

                return {isRetryFutile: isRetryFutile(error.code)};
            });
    };
}
