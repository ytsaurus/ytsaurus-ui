import {type FlowComputationStreamType} from '../../../../../../shared/yt-types';
import {type YTGraphBlock} from '../../../../../components/YTGraph';
import {rumLogError} from '../../../../../rum/rum-counter';
import {type FlowComputationRuntimeType} from '../../types';
import {type FlowGraphBlockItem} from '../FlowGraph';

const PADDING = 50;

type Size = {width: number; height: number};

export class FlowGroupBlock implements YTGraphBlock<
    'computation-group',
    FlowComputationRuntimeType
> {
    meta: FlowComputationRuntimeType;
    id: string;
    name: string;

    is = 'computation-group' as const;
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    selected = false;
    anchors = [];

    backgroundTheme?: YTGraphBlock<
        'computation-group',
        FlowComputationRuntimeType
    >['backgroundTheme'];

    sizes: {stream: Size; computation: Size};

    constructor({
        id,
        computation,
        streamSize,
        computationSize,
        backgroundTheme,
    }: {
        id: string;
        computation: FlowComputationRuntimeType;
        streamSize: Size;
        computationSize: Size;
        backgroundTheme: YTGraphBlock<
            'computation-group',
            FlowComputationRuntimeType
        >['backgroundTheme'];
    }) {
        this.id = id;
        this.meta = {...computation};
        this.name = computation.name;
        this.backgroundTheme = backgroundTheme;

        this.sizes = {stream: streamSize, computation: computationSize};

        Object.assign(this, this.recalcSize());
    }

    recalcSize() {
        const blocks = Object.values(this.layout()).flat();
        // the computation with its paddings spans at least 600px
        const minWidthExtra = Math.max(0, 600 - this.sizes.computation.width - PADDING * 2);
        return {
            width: Math.max(...blocks.map(({x, width}) => x + width + PADDING)) + minWidthExtra,
            height: Math.max(...blocks.map(({y, height}) => y + height + PADDING)),
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

        const layout = this.layout();
        const {x, y} =
            type === 'computation'
                ? layout.computation[0]
                : layout[type as keyof typeof layout][index];

        return {...block, x: x + this.x, y: y + this.y};
    }

    // Positions of the blocks relative to the group, the output streams are placed to the right
    // of all other blocks except the source streams
    private layout() {
        const {stream, computation} = this.sizes;
        const {
            source_streams = [],
            timer_streams = [],
            key_visitor_streams = [],
            output_streams = [],
        } = this.meta;

        const hasSources = source_streams.length > 0;
        const left = hasSources ? PADDING * 2 + stream.width : PADDING;
        const bottom = PADDING * 2 + computation.height;
        const step = {x: stream.width + PADDING, y: stream.height + PADDING};

        // Key-visitor streams are placed in the column to the right of the timer streams,
        // they take the place of the timer streams when there are none
        const keyVisitorLeft = left + (timer_streams.length > 0 ? step.x : 0);

        const column = (ids: Array<string>, x: number, top: number) =>
            ids.map((_id, i) => ({x, y: top + i * step.y, ...stream}));

        const res = {
            computation: [{x: left, y: PADDING, ...computation}],
            source_streams: column(source_streams, PADDING, bottom),
            timer_streams: column(timer_streams, left, bottom),
            key_visitor_streams: column(key_visitor_streams, keyVisitorLeft, bottom),
        };

        const right = Math.max(
            ...[...res.computation, ...res.timer_streams, ...res.key_visitor_streams].map(
                ({x, width}) => x + width,
            ),
        );

        const outputs = column(
            output_streams,
            right + PADDING,
            PADDING + (computation.height - stream.height) / 2,
        );

        return {...res, output_streams: outputs};
    }
}
