import {FlowComputationType, FlowComputationStreamType} from '../../../../../../shared/yt-types';

import {YTGraphBlock} from '../../../../../components/YTGraph';
import {rumLogError} from '../../../../../rum/rum-counter';

import {FlowGraphBlockItem} from '../FlowGraph';

const PADDING = 50;

type Size = {width: number; height: number};

export class FlowGroupBlock implements YTGraphBlock<'computation-group', FlowComputationType> {
    meta: FlowComputationType;
    id: string;
    name: string;

    is = 'computation-group' as const;
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    selected = false;
    anchors = [];

    backgroundTheme?: YTGraphBlock<'computation-group', FlowComputationType>['backgroundTheme'];

    sizes: {stream: Size; computation: Size};

    constructor({
        id,
        computation,
        streamSize,
        computationSize,
        backgroundTheme,
    }: {
        id: string;
        computation: FlowComputationType;
        streamSize: Size;
        computationSize: Size;
        backgroundTheme: YTGraphBlock<'computation-group', FlowComputationType>['backgroundTheme'];
    }) {
        this.id = id;
        this.meta = computation;
        this.name = computation.id;
        this.backgroundTheme = backgroundTheme;

        this.sizes = {stream: streamSize, computation: computationSize};

        Object.assign(this, this.recalcSize());
    }

    recalcSize() {
        const {stream, computation} = this.sizes;

        const res = {
            width: Math.max(600, computation.width + PADDING * 2),
            height: computation.height + PADDING * 2,
        };

        const {source_streams, timer_streams, output_streams} = this.meta;

        const extraHeight = Math.max(
            0,
            (source_streams?.length ?? 0) * (PADDING + stream.height),
            (timer_streams?.length ?? 0) * (PADDING + stream.height),
            (output_streams?.length ?? 0) * (PADDING + stream.height) - computation.height,
        );

        let extraWidth = 0;

        if (source_streams?.length > 0) {
            extraWidth += stream.width + PADDING;
        }

        if (output_streams?.length > 0) {
            extraWidth += stream.width + PADDING;
        }

        return {
            width: res.width + extraWidth,
            height: res.height + extraHeight,
        };
    }

    updateBlockPosition<T extends FlowComputationStreamType | 'computation'>(
        type: T,
        block: FlowGraphBlockItem<'stream'> | FlowGraphBlockItem<'computation'>,
    ) {
        if (block.groupId !== this.id) {
            rumLogError(
                {
                    additional: {
                        id: this.id,
                        'block.id': block.id,
                        'block.groupId': block.groupId,
                    },
                },
                new Error('Unexpected behaviour: block.groupId is mismatched with this.id'),
            );
            return block;
        }

        const {width, height} = this.sizes.stream;

        let index = 0;
        if (type !== 'computation') {
            const t = type as Exclude<typeof type, 'computation'>;
            index = this.meta[t]?.indexOf(block.id);
            if (index === -1) {
                rumLogError(
                    {
                        additional: {
                            type,
                            id: this.id,
                            'block.id': block.id,
                            [`meta.${type}`]: this.meta[t].join(','),
                        },
                    },
                    new Error(
                        `Unexpected behaviour: block.id = ${block.id} should be found in meta.${type}`,
                    ),
                );
                return block;
            }
        }

        const {computation, stream} = this.sizes;

        const byIndex = {width: index * (width + PADDING), height: index * (height + PADDING)};

        block.y =
            type === 'output_streams' || type === 'computation'
                ? PADDING + byIndex.height
                : PADDING * 2 + computation.height + byIndex.height;

        if (type === 'source_streams') {
            block.x = PADDING;
        } else if (type === 'timer_streams') {
            const hasSources = this.meta.source_streams?.length > 0;
            block.x = hasSources ? PADDING * 2 + width + byIndex.width : PADDING;
        } else if (type === 'output_streams') {
            const hasSources = this.meta.source_streams?.length > 0;
            block.x = 2 * PADDING + computation.width;
            if (hasSources) {
                block.x += PADDING + width;
            }
            block.y += (computation.height - stream.height) / 2;
        } else if (type === 'computation') {
            const hasSources = this.meta.source_streams?.length > 0;
            block.x = PADDING;
            if (hasSources) {
                block.x += PADDING + width;
            }
        }

        return {...block, x: block.x + this.x, y: block.y + this.y};
    }
}
