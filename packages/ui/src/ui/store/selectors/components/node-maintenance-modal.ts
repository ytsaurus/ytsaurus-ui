import reduce_ from 'lodash/reduce';
import {createSelector} from 'reselect';

import {RootState} from '../../reducers';
import {selectClusterUiConfig} from '../global';
import {NodeResourceLimits} from '../../../store/reducers/components/node-maintenance-modal';

export const selectNodeMaintenanceModalState = (state: RootState) =>
    state.components.nodeMaintenanceModal;

export const selectNodeMaintenanceModalInitialValues = createSelector(
    [selectNodeMaintenanceModalState],
    ({maintenance, resourceLimitsOverrides, role}) => {
        return {
            ...maintenance,
            role: {role},
            limits: reduce_(
                resourceLimitsOverrides,
                (acc, value, k) => {
                    const key = k as keyof typeof acc;
                    acc[key] = {value};
                    return acc;
                },
                {} as Partial<Record<keyof NodeResourceLimits, {value?: number}>>,
            ),
        };
    },
);

export const selectIsAllowedMaintenanceApiNodes = (state: RootState) =>
    selectClusterUiConfig(state).enable_maintenance_api_nodes;

export const selectIsAllowedMaintenanceApiProxies = (state: RootState) =>
    selectClusterUiConfig(state).enable_maintenance_api_proxies;
