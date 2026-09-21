import {type TConnection} from '@gravity-ui/graph';

import {
    applyConnectionStyle,
    makeStreamConsumersCenterY,
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

describe('makeStreamConsumersCenterY', () => {
    const getSortKey = makeStreamConsumersCenterY(
        [
            {sourceBlockId: 'both', targetBlockId: 'top'},
            {sourceBlockId: 'both', targetBlockId: 'bottom'},
            {sourceBlockId: 'top-only', targetBlockId: 'top'},
            {sourceBlockId: 'not-laid-out', targetBlockId: 'missing'},
        ],
        [
            {id: 'top', y: 0, height: 100},
            {id: 'bottom', y: 200, height: 100},
        ],
    );

    it.each([
        {streamId: 'both', expected: 150},
        {streamId: 'top-only', expected: 50},
        {streamId: 'not-laid-out', expected: Infinity},
        {streamId: 'no-consumers', expected: Infinity},
    ])('returns $expected for $streamId', ({streamId, expected}) => {
        expect(getSortKey(streamId)).toBe(expected);
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
    const connections = [
        {sourceBlockId: 'src-a', targetBlockId: 'group', points: ['route-200']},
        {sourceBlockId: 'src-b', targetBlockId: 'group', points: ['route-0']},
        {sourceBlockId: 'src-c', targetBlockId: 'group', points: ['route-100']},
        {sourceBlockId: 'other', targetBlockId: 'group', points: ['route-other']},
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
            'src-a': ['route-0'],
            'src-b': ['route-100'],
            'src-c': ['route-200'],
            other: ['route-other'],
        });
    });

    it('keeps the layout when a source is not laid out', () => {
        const {positions} = order(['src-a', 'src-b', 'missing']);

        expect(positions['src-a']).toEqual({x: 0, y: 200});
        expect(positions['src-b']).toEqual({x: 0, y: 0});
    });
});
