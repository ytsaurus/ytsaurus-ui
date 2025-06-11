import CpuIcon from '@gravity-ui/icons/svgs/cpu.svg';

import format from '../../../../../../common/hammer/format';

import {YTGrapCanvasBlock} from '../../../../../../components/YTGraph';
import {FlowGraphBlockItem} from '../FlowGraph';

const PADDING = 15;

export class ComputationCanvasBlock extends YTGrapCanvasBlock<FlowGraphBlockItem<'computation'>> {
    renderBlock(mode: 'minimalistic' | 'schematic'): void {
        this.drawBorder({});

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
            yPos: PADDING,
            xPos: PADDING,
            text: this.state.name,
            fontSize: 'header',
            padding: PADDING,
        });

        const counts: Array<string> = [];
        if (Number.isFinite(count)) {
            if (Number.isFinite(Executing)) {
                counts.push(String(Executing));
                if (count !== Executing) {
                    counts.push(String(count));
                }

                this.drawInnerText({
                    yPos: PADDING,
                    xPos: PADDING * 2 + textWidth!,
                    text: counts.join('/'),
                    color: 'secondary',
                    padding: PADDING,
                    fontSize: 'header',
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

        const maxWidth = Math.round((width - PADDING * 3) / 2);
        const yPos = Math.round(height / 2.1);

        this.drawMetaItem({
            xPos: PADDING,
            yPos,
            maxWidth,
            label: 'CPU',
            value: format.Number(cpu_usage_current, {digits: 1}),
            fontSize: 'header',
            padding: PADDING,
        });

        const value = format.Bytes(memory_usage_current, {digits: 1});
        this.drawMetaItem({
            xPos: PADDING * 1.5 + maxWidth,
            yPos,
            maxWidth,
            label: 'RAM',
            value,
            fontSize: 'header',
            padding: PADDING,
        });
    }
}
