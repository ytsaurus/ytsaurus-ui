import {createSelector} from 'reselect';
import reduce_ from 'lodash/reduce';
import isEmpty_ from 'lodash/isEmpty';
import {getQuerySingleProgress} from './query';
import {
    ProcessedGraph,
    ProcessedNode,
    isOperationFinished,
    operationsStateConfig,
    preprocess,
} from '../../../pages/query-tracker/Plan/utils';
import type {NodeStages, NodeState} from '../../../pages/query-tracker/Plan/models/plan';

const LINE_WIDTH = 25;

function ellipsis(input: string) {
    if (input.length > LINE_WIDTH) {
        return '…' + input.slice(-LINE_WIDTH);
    }
    return input;
}

function getLabelWithStage(name: string, stages: NodeStages) {
    try {
        const stage = Object.keys(stages[Object.keys(stages).length - 1])[0];
        return `${ellipsis(name)}\n(${stage})`;
    } catch {
        return '';
    }
}

export const getProcessedGraph = createSelector(
    [getQuerySingleProgress],
    (progress): ProcessedGraph | undefined => {
        const plan = progress.yql_plan;
        return plan ? preprocess(plan) : undefined;
    },
);

export const getNodesWithProgress = createSelector(
    [getProcessedGraph, getQuerySingleProgress],
    (graph, progress): ProcessedNode[] => {
        if (!graph) return [];

        const yqlProgress = progress.yql_progress ?? {};

        return graph.nodes.map((node) => {
            const nodeProgress = yqlProgress[node.id];
            if (!nodeProgress) return node;

            let label = node.label;
            if (nodeProgress.stages && !isEmpty_(nodeProgress.stages)) {
                if (isOperationFinished(nodeProgress.state)) {
                    label = ellipsis(node.title ?? '');
                } else {
                    label = getLabelWithStage(node.title ?? '', nodeProgress.stages);
                }
            }

            return {
                ...node,
                progress: nodeProgress,
                label,
            };
        });
    },
);

export const getQueryStartedAtMillis = createSelector(
    [getQuerySingleProgress],
    (progress): number => {
        return reduce_(
            progress.yql_progress ?? {},
            (acc, el) => {
                const start = el.startedAt ? new Date(el.startedAt).getTime() : Infinity;
                return Math.min(start, acc);
            },
            Infinity,
        );
    },
);

const RESERVE_TO_EVENT = 1_000;
export const getProgressInterval = createSelector([getNodesWithProgress], (nodes) => {
    if (!nodes.length) return undefined;

    return nodes.reduce(
        (acc, {progress}) => {
            if (!progress) return acc;

            const {startedAt, finishedAt} = progress;
            const from = (startedAt ? new Date(startedAt).getTime() : acc.from) - RESERVE_TO_EVENT;
            const to = (finishedAt ? new Date(finishedAt).getTime() : acc.to) + RESERVE_TO_EVENT;

            acc.from = from < acc.from ? from : acc.from;
            acc.to = to > acc.to ? to : acc.to;

            return acc;
        },
        {from: Infinity, to: -Infinity},
    );
});

export const getOperationNodesStates = createSelector([getNodesWithProgress], (nodes) => {
    const counts: Partial<Record<NodeState | 'NotStarted', number>> = {};

    nodes.forEach((node) => {
        if (node.type === 'in' || node.type === 'out') {
            return;
        }
        const state = node.progress?.state || 'NotStarted';
        if (counts[state] === undefined) {
            counts[state] = 0;
        }
        counts[state]! += 1;
    });

    const states = Object.keys(operationsStateConfig) as NodeState[];
    return states.map((state) => {
        return {
            state,
            title: operationsStateConfig[state].title,
            count: counts[state] || 0,
        };
    });
});
