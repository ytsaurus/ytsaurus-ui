import {ValueOf} from '../../@types/types';

export const NODE_TYPE = {
    ALL_NODES: 'cluster_nodes',
    DATA_NODES: 'data_nodes',
    EXEC_NODES: 'exec_nodes',
    TABLET_NODES: 'tablet_nodes',
    CHAOS_NODES: 'chaos_nodes',
} as const;

export type NodeType = ValueOf<typeof NODE_TYPE>;
