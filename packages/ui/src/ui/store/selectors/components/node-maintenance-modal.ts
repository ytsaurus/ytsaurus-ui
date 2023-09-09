import {createSelector} from 'reselect';

import {RootState} from '../../reducers';
import {getClusterUiConfig} from '../global';
import {isSupportedNodeMaintenanceApi} from '../thor/support';

export const getNodeMaintenanceModalData = (state: RootState) =>
    state.components.nodeMaintenanceModal;

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
