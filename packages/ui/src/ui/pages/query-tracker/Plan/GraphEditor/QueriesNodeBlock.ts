import {ECameraScaleLevel} from '@gravity-ui/graph';

import {BaseMeta, NodeTBlock} from '../../../../components/YTGraph/canvas/NodeBlock';

import {type NodeDetails, NodeProgress} from '../models/plan';
import {OperationSchemas} from '../utils';

export type QueriesBlockMeta = BaseMeta & {
    level: ECameraScaleLevel;
    nodeProgress?: NodeProgress;
    schemas?: OperationSchemas;
    details?: NodeDetails;
};

export type QueriesNodeBlock = NodeTBlock<QueriesBlockMeta>;
