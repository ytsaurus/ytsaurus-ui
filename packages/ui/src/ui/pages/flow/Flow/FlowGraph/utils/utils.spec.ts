import {type TConnection} from '@gravity-ui/graph';

import {applyConnectionStyle, mergeConnectionStreamStatus} from './utils';

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
