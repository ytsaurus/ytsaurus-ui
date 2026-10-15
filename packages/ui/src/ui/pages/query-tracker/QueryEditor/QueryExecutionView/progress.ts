import type {
    QueryGraphNode,
    QueryGraphNodeStatus,
    QueryProgressProps,
    QueryTimelineItem,
} from '@gravity-ui/querieskit';
import {type ProcessedGraph, type ProcessedNode, operationsStateConfig} from '../../Plan/utils';
import {preparePlanNode} from '../../Plan/services/preparePlanNode';
import type {NodeState} from '../../Plan/models/plan';

const statuses: Record<NodeState | 'NotStarted', QueryGraphNodeStatus> = {
    NotStarted: 'not-started',
    Started: 'waiting',
    InProgress: 'running',
    Finished: 'completed',
    Failed: 'failed',
    Aborted: 'aborted',
};

const timelineColorNames: Record<NodeState | 'NotStarted', string> = {
    NotStarted: 'new',
    Started: 'started',
    InProgress: 'running',
    Finished: 'completed',
    Failed: 'failed',
    Aborted: 'aborted',
};

const timelineStatuses = (Object.keys(statuses) as Array<keyof typeof statuses>).map((state) => ({
    id: statuses[state],
    label: operationsStateConfig[state].title,
    color: `var(--yql-graph-color-operation-${timelineColorNames[state]})`,
}));

function timestamp(value?: string) {
    const millis = value ? Date.parse(value) : NaN;
    return Number.isFinite(millis) ? millis : undefined;
}

export function prepareProgress(
    nodes: ProcessedNode[],
    edges: ProcessedGraph['edges'],
    operationIdToCluster: Map<string, string>,
): Pick<QueryProgressProps, 'graphProps' | 'timelineProps'> {
    const urls = new Map<string, string>();
    const graphNodes: QueryGraphNode[] = [];
    const items: QueryTimelineItem[] = [];
    for (const original of nodes) {
        const node = preparePlanNode({...original}, operationIdToCluster);
        if (node.url) urls.set(node.id, node.url);
        const {progress} = node;
        const status = statuses[progress?.state || 'NotStarted'];
        const jobs = progress && {
            total: progress.total,
            completed: progress.completed,
            running: progress.running,
            pending: progress.pending,
            failed: progress.failed,
            aborted: progress.aborted,
        };
        const start = timestamp(progress?.startedAt);
        const finishedAt = timestamp(progress?.finishedAt);
        // Query Tracker also returns the legacy indexed form used by the existing timeline.
        const stageEntries: Array<[string, string | Record<string, string>]> = Object.entries(
            progress?.stages || {},
        );
        const stages = stageEntries
            .flatMap(([id, stage]) => {
                if (typeof stage === 'string') return [{id, label: id, start: timestamp(stage)}];
                return Object.entries(stage).map(([label, time]) => ({
                    id,
                    label,
                    start: timestamp(time),
                }));
            })
            .filter((stage): stage is typeof stage & {start: number} => stage.start !== undefined)
            .sort((a, b) => a.start - b.start);
        const terminal = status === 'completed' || status === 'failed' || status === 'aborted';
        const end = finishedAt ?? (terminal ? (stages.at(-1)?.start ?? start) : undefined);
        const timelineStages = stages.map((stage, index) => ({
            id: `${node.id}/${stage.id}`,
            label: stage.label,
            interval: {start: stage.start, end: stages[index + 1]?.start ?? end},
        }));
        const name = node.title || node.id;
        graphNodes.push({
            id: node.id,
            name,
            kind: ({in: 'input', out: 'output', op: 'operation'} as const)[node.type || 'op'],
            status,
            progress: jobs,
            popup: {
                jobs,
                stages: timelineStages
                    .filter((stage) => stage.interval.end !== undefined)
                    .map((stage) => ({
                        name: stage.label,
                        duration:
                            (stage.interval.end ?? stage.interval.start) - stage.interval.start,
                    })),
                details: Object.entries(node.details || {}).map(([key, value]) => ({
                    name: key,
                    value: typeof value === 'string' ? value : JSON.stringify(value),
                })),
                inputs: node.schemas?.inputs.map((schema) => ({
                    name: schema.name,
                    columns: [{name: schema.name, type: JSON.stringify(schema.type)}],
                })),
                outputs: node.schemas?.outputs.map((schema) => ({
                    name: schema.name,
                    columns: [{name: schema.name, type: JSON.stringify(schema.type)}],
                })),
            },
        });
        if (node.type === 'op') {
            items.push({
                id: node.id,
                label: name,
                status,
                href: node.url,
                interval: start === undefined ? undefined : {start, end},
                stages: timelineStages,
                progress: jobs,
            });
        }
    }
    return {
        graphProps: {
            nodes: graphNodes,
            edges: edges.map(({from, to}, index) => ({
                id: `${from}/${to}/${index}`,
                source: from,
                target: to,
            })),
            largeGraphThreshold: 250,
            onNodeClick: (node) => {
                const url = urls.get(node.id);
                if (url) window.open(url, '_blank', 'noopener,noreferrer');
            },
        },
        timelineProps: {items, statuses: timelineStatuses},
    };
}
