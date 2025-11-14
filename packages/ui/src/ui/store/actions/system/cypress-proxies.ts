import {ThunkAction, UnknownAction} from '@reduxjs/toolkit';

import {Toaster} from '@gravity-ui/uikit';

import {USE_SUPRESS_SYNC} from '../../../../shared/constants';
import {getBatchError} from '../../../../shared/utils/error';
import ypath from '../../../common/thor/ypath';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {RootState} from '../../../store/reducers';
import {
    fetchCypressProxiesFailure,
    fetchCypressProxiesRequest,
    fetchCypressProxiesSuccess,
} from '../../../store/reducers/system/cypress-proxies';
import {RoleGroupItemInfo} from '../../../store/reducers/system/proxies';
import {isRetryFutile} from '../../../utils/index';
import {extractProxyCounters, extractRoleGroups} from '../../../utils/system/proxies';
import {showErrorPopup} from '../../../utils/utils';

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
        if (cypressProxies[proxy]) {
            const proxyData = ypath.getAttributes(cypressProxies[proxy]);
            const state = ypath.getValue(proxyData, '/state');
            const effectiveState = !state || state === 'unknown' ? 'other' : state;
            const banned = ypath.getValue(proxyData, '/@banned');
            result.push({
                name: proxy,
                state,
                effectiveState,
                banned,
            });
        }
    }
    return result;
}

export function loadSystemCypressProxies(): CypressProxiesThunkAction<
    undefined | {isRetryFutile: boolean}
> {
    return (dispatch) => {
        dispatch(fetchCypressProxiesRequest());

        return ytApiV3Id
            .executeBatch(YTApiId.systemCypressProxies, {
                requests: [
                    {
                        command: 'get',
                        parameters: {
                            path: '//sys/cypress_proxies',
                            attributes: ['banned', 'state'],
                            ...USE_SUPRESS_SYNC,
                        },
                    },
                ],
            })
            .then((result) => {
                const error = getBatchError(result, 'Failed to load CypressProxies');
                if (error) {
                    throw error;
                }

                const data = result?.[0]?.output;
                const cypressProxies = extractCypressProxy(data);

                dispatch(
                    fetchCypressProxiesSuccess({
                        roleGroups: extractRoleGroups(cypressProxies),
                        counters: extractProxyCounters(cypressProxies),
                    }),
                );
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
