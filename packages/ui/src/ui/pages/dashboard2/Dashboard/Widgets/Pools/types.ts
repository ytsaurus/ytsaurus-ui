import {PluginWidgetProps} from '@gravity-ui/dashkit';
import type {PoolPair} from '../../../../../components/Dialog/controls/PoolsMultiple/PoolsMultiple';

export type PoolResource = {
    value: number;
    usage: number;
    guarantee: number;
};

export type Pool = {
    general: {pool: string; tree: string};
    cpu: PoolResource;
    memory: PoolResource;
    gpu: PoolResource;
    operations: PoolResource;
};

export type PoolsWidgetData = {
    name: string;
    pools: PoolPair[];
    columns: string[];
};

export type PoolsWidgetProps = PluginWidgetProps & {
    data?: PoolsWidgetData;
};
