import {ECameraScaleLevel} from '@gravity-ui/graph';

import {NodeTBlock} from '../../../../components/YTGraph/canvas/NodeBlock';

import {type NodeDetails, NodeProgress} from '../models/plan';
import {OperationSchemas} from '../utils';

export type QueriesBlockMeta = {
    level: ECameraScaleLevel;
    icon: {
        src: string;
        height: number;
        width: number;
    };
    bottomText?: string;
    textSize: number;
    padding?: number;
    nodeProgress?: NodeProgress;
    schemas?: OperationSchemas;
    details?: NodeDetails;
};

export type QueriesNodeBlock = NodeTBlock<QueriesBlockMeta>;
