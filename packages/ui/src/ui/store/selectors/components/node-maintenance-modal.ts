import reduce_ from 'lodash/reduce';
import {createSelector} from 'reselect';

import {RootState} from '../../reducers';
import {getClusterUiConfig} from '../global';
import {isSupportedNodeMaintenanceApi} from '../thor/support';
import {NodeResourceLimits} from 'store/reducers/components/node-maintenance-modal';

export const getNodeMaintenanceModalState = (state: RootState) =>
    state.components.nodeMaintenanceModal;

export const getNodeMaintenanceModalInitialValues = createSelector(
    [getNodeMaintenanceModalState],
    ({maintenance, resourceLimitsOverrides}) => {
        return {
            maintenance,
            limits: reduce_(
                resourceLimitsOverrides,
                (acc, value, k) => {
                    const key = k as keyof typeof acc;
                    acc[key] = {value};
                    return acc;
                },
                {} as Record<keyof NodeResourceLimits, {value?: number}>,
            ),
        };
    },
);

export const isAllowedMaintenanceApiNodes = createSelector(
    [isSupportedNodeMaintenanceApi, getClusterUiConfig],
    (isSupported, uiConfig) => {
        return isSupported && Boolean(uiConfig.enable_maintenance_api_nodes);
    },
);

export const isAllowedMaintenanceApiProxies = createSelector(
    [isSupportedNodeMaintenanceApi, getClusterUiConfig],
    (isSupported, uiConfig) => {
        return isSupported && Boolean(uiConfig.enable_maintenance_api_proxies);
    },
);
