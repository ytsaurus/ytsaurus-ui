import {createSelector} from 'reselect';

import {RootState} from '../../reducers';
import {getClusterUiConfig} from '../global';
import {isSupportedNodeMaintenanceApi} from '../thor/support';

export const getNodeMaintenanceModalData = (state: RootState) =>
    state.components.nodeMaintenanceModal;

export const isAllowedMaintenanceApi = createSelector(
    [isSupportedNodeMaintenanceApi, getClusterUiConfig],
    (isSupported, uiConfig) => {
        return isSupported && Boolean(uiConfig.enable_nodes_maintenance_api);
    },
);
