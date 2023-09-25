import {Action} from 'redux';

import {AddMaintenanceParams} from '../../../../shared/yt-types';
import {ActionD} from '../../../types';
import {
    NODE_MAINTENANCE_PARTIAL,
    NODE_MAINTENANCE_RESET,
} from '../../../constants/components/node-maintenance-modal';
import {mergeStateOnClusterChange} from '../utils';

export type NodeMaintenanceState = {
    address: string;
    component: AddMaintenanceParams['component'];

    maintenance: Partial<
        Record<
            AddMaintenanceParams['type'],
            {
                state?: boolean;
                comment?: string;
                othersComment?: string;
            }
        >
    >;
};

const initialState: NodeMaintenanceState = {
    component: 'cluster_node',
    address: '',
    maintenance: {},
};

function reducer(state: NodeMaintenanceState, action: NodeMaintenanceAction): NodeMaintenanceState {
    switch (action.type) {
        case NODE_MAINTENANCE_RESET:
            return initialState;
        case NODE_MAINTENANCE_PARTIAL: {
            return {...state, ...action.data};
        }
        default:
            return state;
    }
}

export default mergeStateOnClusterChange(initialState, {}, reducer);

export type NodeMaintenanceAction =
    | Action<typeof NODE_MAINTENANCE_RESET>
    | ActionD<
          typeof NODE_MAINTENANCE_PARTIAL,
          Pick<NodeMaintenanceState, 'address' | 'component' | 'maintenance'>
      >;
