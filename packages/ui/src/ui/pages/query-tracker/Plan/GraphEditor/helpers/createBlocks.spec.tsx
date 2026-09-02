jest.mock('@gravity-ui/graph', () => ({
    ECameraScaleLevel: {Detailed: 'detailed'},
}));

jest.mock('../../../../../components/YTGraph/utils/iconToBase', () => ({
    iconToBase: jest.fn(),
}));

jest.mock('./getBlockIcon', () => ({
    getBlockIcon: jest.fn(),
}));

import {ECameraScaleLevel} from '@gravity-ui/graph';

import {createBlocks} from './createBlocks';

describe('createBlocks', () => {
    it('resolves a waiting operation URL from query statistics', () => {
        const {blocks} = createBlocks(
            {
                nodes: [{id: '1', level: 0, type: 'op'}],
                edges: [],
            },
            {1: {waitingRemoteId: 'operation-1'}},
            ECameraScaleLevel.Detailed,
            new Map([['operation-1', 'hahn']]),
        );

        expect(blocks[0].meta.operationUrl).toBe('/hahn/operations/operation-1');
    });
});
