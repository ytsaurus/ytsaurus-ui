import {yqlModel} from './shared';
import {YQLAPIDefinitions} from './yql';

export interface BasicNode {
    id: string;
    name: string;
    level: string;
    type: 'in' | 'out' | 'op';
}

export interface BasicLink {
    source: string;
    target: string;
}

export interface BasicGraph {
    nodes: BasicNode[];
    links: BasicLink[];
}

export interface Stream {
    Name: string;
    Children?: Stream[][];
}

export interface PlanOperation {
    Id: string;
    Name: string;
    InputColumns?: string | string[] | string[][];
    InputKeyFilterColumns?: string | string[];
    Inputs?: [string, string][];
    InputsCount?: string;
    Outputs?: [string, string][];
    OutputsCount?: string;
    DependsOn?: string[];
    Streams?: Record<string, Stream[]>;
}

export interface ProviderPin {
    Id: string;
    Table: string;
    Type?: yqlModel.value.TypeArray;
}

export interface Provider {
    Id: string;
    Cluster: string;
    Name: string;
    Pins: ProviderPin[];
}

export interface Plan {
    Basic: BasicGraph;
    Detailed?: {
        OperationRoot: string;
        OperationStats: Record<string, string>;
        Operations: PlanOperation[];
        Providers: Provider[];
    };
}

export type NodeProgress = YQLAPIDefinitions['NodeProgress'];
export type NodeState = NonNullable<NodeProgress['state']>;
export type NodeStages = NonNullable<NodeProgress['stages']>;
export type NodeDetails = PlanOperation;

export type Progress = Record<string, NodeProgress>;

export const OPERATION_STATE = {
    Started: 'Started',
    InProgress: 'InProgress',
    Finished: 'Finished',
    Failed: 'Failed',
    Aborted: 'Aborted',
} as const;

export function isPlan(plan: Record<string, any> | undefined): plan is Plan {
    return plan && plan.Basic && Array.isArray(plan.Basic.nodes) && plan.Basic.nodes.length > 0;
}
