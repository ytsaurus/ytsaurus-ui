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
    comment: string;
    otherComments: string;
    command: 'add_maintenance' | 'remove_maintenance';
    type: AddMaintenanceParams['type'];
    component: AddMaintenanceParams['component'];
};

const initialState: NodeMaintenanceState = {
    command: 'add_maintenance',
    component: 'cluster_node',
    type: 'ban',
    address: '',
    comment: '',
    otherComments: '',
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
          Pick<NodeMaintenanceState, 'address' | 'comment' | 'component' | 'type'>
      >;
