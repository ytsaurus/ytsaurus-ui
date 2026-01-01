import CpuIcon from '@gravity-ui/icons/svgs/cpu.svg';

import {TAnchor} from '@gravity-ui/graph/build';

import format from '../../../../../common/hammer/format';
import {
    NoopComponent,
    YTGraphCanvasBlock,
    YTGraphFontSize,
} from '../../../../../components/YTGraph';

import {FlowGraphBlockItem} from '../FlowGraph';

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
        const {
            highlight_cpu_usage,
            hightlight_memory_usage,
            metrics: {cpu_usage_10m, memory_usage_10m},
        } = this.state.meta;

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
            value: format.Number(cpu_usage_10m, {digits: 1}),
            fontSize,
            padding: this.PADDING,
            skipLabel,
            color: highlight_cpu_usage ? 'warning' : undefined,
        });

        const value = format.Bytes(memory_usage_10m, {digits: 1});
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

    getAnchorPosition({index = 0}: TAnchor) {
        const {length = 0} = this.state.anchors;

        const {width, height} = this.getGeometry();
        const step = width / (length + 1);

        return {y: height, x: step * (index + 1)};
    }

    renderAnchor: YTGraphCanvasBlock<FlowGraphBlockItem<'computation'>>['renderAnchor'] = () => {
        return NoopComponent.create();
    };
}
