import type {ProcessedNode} from '../../Plan/utils';
import {prepareProgress} from './progress';

jest.mock('../../Plan/services/preparePlanNode', () => ({
    preparePlanNode: (input: ProcessedNode) => ({
        ...input,
        url: `https://example.test/${input.id}`,
    }),
}));

const startedAt = '2026-09-28T10:00:00Z';
const stageAt = '2026-09-28T10:00:01Z';
const finishedAt = '2026-09-28T10:00:03Z';

function node(): ProcessedNode {
    return {
        id: 'op',
        level: 0,
        type: 'op',
        title: 'Map',
        progress: {
            state: 'InProgress',
            startedAt,
            total: 10,
            completed: 3,
            stages: {Preparing: startedAt, Running: stageAt},
        },
    };
}

describe('execution progress adapter', () => {
    test('keeps open operations and their last stages running', () => {
        const result = prepareProgress([node()], [], new Map());
        expect(result.graphProps.nodes[0]).toMatchObject({
            kind: 'operation',
            status: 'running',
            progress: {total: 10, completed: 3},
        });
        expect(result.timelineProps?.items[0]).toMatchObject({
            interval: {start: Date.parse(startedAt), end: undefined},
            href: 'https://example.test/op',
            stages: [
                {interval: {start: Date.parse(startedAt), end: Date.parse(stageAt)}},
                {interval: {start: Date.parse(stageAt), end: undefined}},
            ],
        });
    });

    test('maps completed intervals, stable links and table nodes', () => {
        const operation = node();
        operation.progress = {...operation.progress, state: 'Finished', finishedAt};
        const result = prepareProgress(
            [{id: 'input', level: 0, type: 'in'}, operation, {id: 'output', level: 1, type: 'out'}],
            [
                {from: 'input', to: 'op'},
                {from: 'op', to: 'output'},
            ],
            new Map(),
        );
        expect(result.graphProps.nodes.map(({kind}) => kind)).toEqual([
            'input',
            'operation',
            'output',
        ]);
        expect(result.graphProps.nodes[1].status).toBe('completed');
        expect(result.graphProps.largeGraphThreshold).toBe(250);
        expect(result.graphProps.edges[0]).toMatchObject({source: 'input', target: 'op'});
        expect(result.timelineProps?.items).toHaveLength(1);
        expect(result.timelineProps?.items[0].interval?.end).toBe(Date.parse(finishedAt));
    });

    test('accepts the legacy indexed stage representation', () => {
        const operation = node();
        operation.progress = {
            ...operation.progress,
            stages: {
                '0': {Preparing: startedAt},
                '1': {Running: stageAt},
            } as unknown as NonNullable<ProcessedNode['progress']>['stages'],
        };
        const result = prepareProgress([operation], [], new Map());
        expect(result.timelineProps?.items[0].stages?.map(({label}) => label)).toEqual([
            'Preparing',
            'Running',
        ]);
    });

    test('does not animate completed operations without a finish timestamp', () => {
        const operation = node();
        operation.progress = {...operation.progress, state: 'Finished'};
        const result = prepareProgress([operation], [], new Map());
        expect(result.timelineProps?.items[0].interval?.end).toBe(Date.parse(stageAt));
    });

    test('does not pass invalid timestamps to the timeline or mutate source nodes', () => {
        const original = node();
        original.progress = {state: 'Started', startedAt: 'invalid'};
        const result = prepareProgress([original], [], new Map());
        expect(result.timelineProps?.items[0].interval).toBeUndefined();
        expect(original.url).toBeUndefined();
    });
});
