import {type TConnection} from '@gravity-ui/graph';

import {
    applyConnectionStyle,
    collapseConnectionEndpoints,
    makeComputationGroupId,
    mergeConnectionStreamStatus,
    orderSourcesLikeSourceStreams,
} from './utils';

jest.mock('../../../../../components/YTGraph/constants', () => ({
    GRAPH_COLORS: {
        infoLine: 'info',
        warningLine: 'warning',
    },
}));

describe('Flow graph connection stream status', () => {
    it.each([
        {
            flags: {drained: false, backpressure_detected: false},
            expectedStatus: {drained: false, backpressureDetected: false},
            expectedBackground: undefined,
        },
        {
            flags: {drained: true, backpressure_detected: false},
            expectedStatus: {drained: true, backpressureDetected: false},
            expectedBackground: 'info',
        },
        {
            flags: {drained: false, backpressure_detected: true},
            expectedStatus: {drained: false, backpressureDetected: true},
            expectedBackground: 'warning',
        },
        {
            flags: {drained: true, backpressure_detected: true},
            expectedStatus: {drained: true, backpressureDetected: true},
            expectedBackground: 'warning',
        },
    ])(
        'applies both flags independently: $flags',
        ({flags, expectedStatus, expectedBackground}) => {
            const connection: TConnection = {sourceBlockId: 'source', targetBlockId: 'target'};

            applyConnectionStyle(connection, flags);

            expect(connection).toMatchObject({flowStreamStatus: expectedStatus});
            expect(connection.styles?.background).toBe(expectedBackground);
        },
    );

    it('produces the same combined status regardless of merge order', () => {
        const drainedFirst: TConnection = {sourceBlockId: 'source', targetBlockId: 'target'};
        const backpressuredFirst: TConnection = {
            sourceBlockId: 'source',
            targetBlockId: 'target',
        };

        mergeConnectionStreamStatus(drainedFirst, {
            drained: true,
            backpressureDetected: false,
        });
        mergeConnectionStreamStatus(drainedFirst, {
            drained: false,
            backpressureDetected: true,
        });
        mergeConnectionStreamStatus(backpressuredFirst, {
            drained: false,
            backpressureDetected: true,
        });
        mergeConnectionStreamStatus(backpressuredFirst, {
            drained: true,
            backpressureDetected: false,
        });

        expect(drainedFirst).toEqual(backpressuredFirst);
        expect(drainedFirst).toMatchObject({
            flowStreamStatus: {drained: true, backpressureDetected: true},
            styles: {background: 'warning'},
        });
    });
});

describe('collapseConnectionEndpoints', () => {
    it.each([
        {
            name: 'keeps a connection between top-level blocks',
            src: {id: 'input-stream'},
            dst: {id: 'sink'},
            expected: {sourceBlockId: 'input-stream', targetBlockId: 'sink'},
        },
        {
            name: 'projects a block to its group',
            src: {id: 'stream', groupId: 'source-group'},
            dst: {id: 'sink'},
            expected: {sourceBlockId: 'source-group', targetBlockId: 'sink'},
        },
        {
            name: 'projects both blocks to their groups',
            src: {id: 'output', groupId: 'source-group'},
            dst: {id: 'input', groupId: 'target-group'},
            expected: {sourceBlockId: 'source-group', targetBlockId: 'target-group'},
        },
        {
            name: 'drops a connection inside one group',
            src: {id: 'computation', groupId: 'group'},
            dst: {id: 'output', groupId: 'group'},
            expected: undefined,
        },
    ])('$name', ({src, dst, expected}) => {
        expect(collapseConnectionEndpoints(src, dst)).toEqual(expected);
    });
});

describe('makeComputationGroupId', () => {
    it('returns a stable runtime-only id without layout control characters', () => {
        const groupId = makeComputationGroupId('computation');

        expect(makeComputationGroupId('computation')).toBe(groupId);
        expect(makeComputationGroupId('other-computation')).not.toBe(groupId);
        expect(groupId).not.toContain('\n');
    });
});

describe('orderSourcesLikeSourceStreams', () => {
    const blocks = [
        {id: 'src-a', x: 0, y: 200},
        {id: 'src-b', x: 0, y: 0},
        {id: 'src-c', x: 10, y: 100},
        {id: 'group', x: 300, y: 0},
        {id: 'other', x: 0, y: 500},
    ];
    const route = (y: number) => [{x: 0, y}];
    const connections = [
        {sourceBlockId: 'src-a', targetBlockId: 'group', points: route(200)},
        {sourceBlockId: 'src-b', targetBlockId: 'group', points: route(0)},
        {sourceBlockId: 'src-c', targetBlockId: 'group', points: route(100)},
        {sourceBlockId: 'other', targetBlockId: 'group', points: route(500)},
    ];

    function order(sourceIds: Array<string>) {
        const res = orderSourcesLikeSourceStreams(
            {blocks, connections},
            new Map([['group', sourceIds]]),
        );
        return {
            positions: Object.fromEntries(res.blocks.map(({id, x, y}) => [id, {x, y}])),
            routes: Object.fromEntries(res.connections.map((c) => [c.sourceBlockId, c.points])),
        };
    }

    it('hands out the laid-out slots top-down in the order of the source streams', () => {
        const {positions, routes} = order(['src-a', 'src-b', 'src-c']);

        expect(positions).toEqual({
            'src-a': {x: 0, y: 0},
            'src-b': {x: 10, y: 100},
            'src-c': {x: 0, y: 200},
            group: {x: 300, y: 0},
            other: {x: 0, y: 500},
        });
        expect(routes).toEqual({
            'src-a': route(0),
            'src-b': route(100),
            'src-c': route(200),
            other: route(500),
        });
    });

    it('keeps the layout when a source is not laid out', () => {
        const {positions} = order(['src-a', 'src-b', 'missing']);

        expect(positions['src-a']).toEqual({x: 0, y: 200});
        expect(positions['src-b']).toEqual({x: 0, y: 0});
    });
});
