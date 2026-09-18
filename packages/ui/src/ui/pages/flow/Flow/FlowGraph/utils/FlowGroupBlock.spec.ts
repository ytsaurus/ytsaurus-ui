import {type FlowComputationRuntimeType} from '../../types';
import {type FlowGraphBlockItem} from '../FlowGraph';
import {FlowGroupBlock} from './FlowGroupBlock';

jest.mock('../../../../../rum/rum-counter', () => ({rumLogError: jest.fn()}));

function makeGroup(output_streams: Array<string>) {
    return new FlowGroupBlock({
        id: 'group',
        computation: {
            id: 'computation',
            name: 'Computation',
            output_streams,
            source_streams: [],
            timer_streams: [],
        } as unknown as FlowComputationRuntimeType,
        streamSize: {width: 100, height: 50},
        computationSize: {width: 200, height: 100},
        backgroundTheme: undefined,
    });
}

function getOutputStreamsTopDown(group: FlowGroupBlock, ids: Array<string>) {
    return ids
        .map((id) => {
            const stream = {id, groupId: group.id} as FlowGraphBlockItem<'stream'>;
            return group.updateBlockPosition('output_streams', stream);
        })
        .sort((l, r) => l.y - r.y)
        .map(({id}) => id);
}

describe('FlowGroupBlock output streams', () => {
    it('keeps the original order by default', () => {
        const group = makeGroup(['a', 'b', 'c']);

        expect(getOutputStreamsTopDown(group, ['c', 'b', 'a'])).toEqual(['a', 'b', 'c']);
    });

    it('places streams in the order of their sort keys, stable for equal keys', () => {
        const group = makeGroup(['a', 'b', 'c', 'd']);
        const keys: Record<string, number> = {a: 300, b: 100, c: Infinity, d: 100};

        group.sortOutputStreams((id) => keys[id]);

        expect(getOutputStreamsTopDown(group, ['a', 'b', 'c', 'd'])).toEqual(['b', 'd', 'a', 'c']);
    });
});
