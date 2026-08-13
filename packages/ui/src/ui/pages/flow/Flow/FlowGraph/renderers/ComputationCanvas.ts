import {type TAnchor} from '@gravity-ui/graph';
import CpuIcon from '@gravity-ui/icons/svgs/cpu.svg';
import format from '../../../../../common/hammer/format';
import {
    YTGraphCanvasBlock,
    type YTGraphFontSize,
} from '../../../../../components/YTGraph';
import {type FlowGraphBlockItem} from '../FlowGraph';
import {
    COMPUTATION_IN,
    COMPUTATION_OUT,
    COMPUTATION_TIMER_IN,
    COMPUTATION_TIMER_OUT,
} from '../utils/utils';
import {ComputationAnchor} from './ComputationAnchor';

export class ComputationCanvasBlock extends YTGraphCanvasBlock<FlowGraphBlockItem<'computation'>> {
    PADDING = 15;

    getComputationFontSize(): YTGraphFontSize {
        return 'header' as const;
    }

    renderBlock(mode: 'minimalistic' | 'schematic'): void {
        this.drawBorder({backgroundTheme: this.state.backgroundTheme});

        if (mode === 'minimalistic') {
            this.drawCenteredIcon({src: CpuIcon, size: 50});
        } else {
            this.renderHeader();
            this.renderMeta();
        }
    }

    renderHeader() {
        const {count, count_by_state: {executing} = {}} = this.state.meta.partitions_stats ?? {};

        const textWidth = this.drawInnerText({
            yPos: this.PADDING,
            xPos: this.PADDING,
            text: this.state.name,
            fontSize: this.getComputationFontSize(),
            padding: this.PADDING,
        });

        const counts: Array<string> = [];
        if (Number.isFinite(count) && Number.isFinite(executing)) {
            counts.push(String(executing));
            if (count !== executing) {
                counts.push(String(count));
            }

            this.drawInnerText({
                yPos: this.PADDING,
                xPos: this.PADDING * 2 + textWidth!,
                text: counts.join('/'),
                color: 'secondary',
                padding: this.PADDING,
                fontSize: this.getComputationFontSize(),
                align: 'right',
            });
        }
    }

    renderMeta() {
        const {height, width} = this.state;
        const {highlight_cpu_usage, hightlight_memory_usage, cpu_usage, memory_usage} =
            this.state.meta;

        const maxWidth = Math.round((width - this.PADDING * 3) / 2);
        let yPos = Math.round(height / 2.1);

        const fontSize = this.getComputationFontSize();
        const fontHeight = this.getFontHeight(fontSize);
        const skipLabel = fontHeight * 2 >= height - yPos - this.PADDING;

        yPos = skipLabel ? height - this.PADDING - fontHeight : yPos;

        this.drawMetaItem({
            xPos: this.PADDING,
            yPos,
            maxWidth,
            label: 'CPU',
            value: format.Number(cpu_usage, {digits: 1}),
            fontSize,
            padding: this.PADDING,
            skipLabel,
            color: highlight_cpu_usage ? 'warning' : undefined,
        });

        const value = format.Bytes(memory_usage, {digits: 1});
        this.drawMetaItem({
            xPos: this.PADDING * 1.5 + maxWidth,
            yPos,
            maxWidth,
            label: 'RAM',
            value,
            fontSize,
            padding: this.PADDING,
            skipLabel,
            color: hightlight_memory_usage ? 'warning' : undefined,
        });
    }

    getAnchorPosition(anchor: TAnchor) {
        const {type} = anchor;
        const {width, height} = this.state;

        const BOTTOM_ANCHORS_COUNT = 2;
        const step = width / (BOTTOM_ANCHORS_COUNT + 1);

        switch (type) {
            case COMPUTATION_TIMER_IN:
                return {y: height, x: step};
            case COMPUTATION_TIMER_OUT:
                return {y: height, x: step * 2};
            case COMPUTATION_IN:
                return {y: height / 2, x: 0};
            case COMPUTATION_OUT:
                return {y: height / 2, x: width};
        }
        return super.getAnchorPosition(anchor);
    }

    override renderAnchor: YTGraphCanvasBlock<FlowGraphBlockItem<'computation'>>['renderAnchor'] = (
        anchor,
    ) => {
        return ComputationAnchor.create(
            {
                ...anchor,
                zIndex: this.zIndex,
                size: 24,
                lineWidth: 2,
                port: this.getAnchorPort(anchor.id),
            },
            {
                key: anchor.id,
            },
        );
    };
}
