import {YTGraphCanvasBlock} from '../../../../../components/YTGraph';
import {FlowGraphBlockItem} from '../FlowGraph';

const PADDING = 10;

export class SinkCanvasBlock extends YTGraphCanvasBlock<FlowGraphBlockItem<'sink'>> {
    renderBlock(mode: 'minimalistic' | 'schematic'): void {
        this.drawBorder({backgroundTheme: this.state.backgroundTheme});

        if (mode === 'minimalistic') {
            this.drawCenteredIcon({src: this.state.icon});
        } else {
            this.renderHeader();
        }
    }

    renderHeader() {
        const w = 24;

        this.drawInnerIcon({
            src: this.state.icon,
            xPos: PADDING,
            yPos: PADDING,
            w,
            h: w,
        });

        const yPos = PADDING + 4;
        const xPos = PADDING + w + 2;

        this.drawInnerText({
            yPos,
            xPos,
            text: this.state.name,
            fontSize: 'header',
            padding: PADDING,
            oneLine: true,
        });
    }
}
