import {preparePlanNode} from './preparePlanNode';

describe('preparePlanNode', () => {
    it('makes an operation with waitingRemoteId clickable', () => {
        const node = preparePlanNode(
            {
                id: '1',
                level: 0,
                type: 'op',
                progress: {waitingRemoteId: 'hahn/operation-1'},
            },
            new Map(),
        );

        expect(node.url).toBe('/hahn/operations/operation-1');
    });
});
