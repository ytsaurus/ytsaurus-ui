import CpuIcon from '@gravity-ui/icons/svgs/cpu.svg';

import {TAnchor} from '@gravity-ui/graph/build';

import format from '../../../../../../common/hammer/format';
import {
    NoopComponent,
    YTGrapCanvasBlock,
    YTGraphFontSize,
} from '../../../../../../components/YTGraph';

import {FlowGraphBlockItem} from '../FlowGraph';

export class ComputationCanvasBlock extends YTGrapCanvasBlock<FlowGraphBlockItem<'computation'>> {
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
        const {count, count_by_state: {Executing} = {}} = this.state.meta.partitions_stats ?? {};

        const textWidth = this.drawInnerText({
            yPos: this.PADDING,
            xPos: this.PADDING,
            text: this.state.name,
            fontSize: this.getComputationFontSize(),
            padding: this.PADDING,
        });

        const counts: Array<string> = [];
        if (Number.isFinite(count)) {
            if (Number.isFinite(Executing)) {
                counts.push(String(Executing));
                if (count !== Executing) {
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
    }

    renderMeta() {
        const {height, width} = this.state;
        const {
            metrics: {cpu_usage_current, memory_usage_current},
        } = this.state.meta;

        const maxWidth = Math.round((width - this.PADDING * 3) / 2);
        const yPos = Math.round(height / 2.1);

        this.drawMetaItem({
            xPos: this.PADDING,
            yPos,
            maxWidth,
            label: 'CPU',
            value: format.Number(cpu_usage_current, {digits: 1}),
            fontSize: this.getComputationFontSize(),
            padding: this.PADDING,
        });

        const value = format.Bytes(memory_usage_current, {digits: 1});
        this.drawMetaItem({
            xPos: this.PADDING * 1.5 + maxWidth,
            yPos,
            maxWidth,
            label: 'RAM',
            value,
            fontSize: this.getComputationFontSize(),
            padding: this.PADDING,
        });
    }

    getAnchorPosition({index = 0}: TAnchor) {
        const {length = 0} = this.state.anchors;

        const {width, height} = this.getGeometry();
        const step = width / (length + 1);

        return {y: height, x: step * (index + 1)};
    }

    renderAnchor: YTGrapCanvasBlock<FlowGraphBlockItem<'computation'>>['renderAnchor'] = () => {
        return NoopComponent.create();
    };
}
