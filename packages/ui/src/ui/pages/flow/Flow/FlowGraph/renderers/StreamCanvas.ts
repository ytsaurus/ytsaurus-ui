import {TAnchor} from '@gravity-ui/graph';

import format from '../../../../../common/hammer/format';

import {NoopComponent, YTGraphCanvasBlock} from '../../../../../components/YTGraph';
import {FlowGraphBlockItem} from '../FlowGraph';

const PADDING = 10;

export class StreamCanvasBlock extends YTGraphCanvasBlock<FlowGraphBlockItem<'stream'>> {
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

        this.drawInnerText({
            yPos: yPos + 35,
            xPos,
            text: format.Bytes(this.state.meta.bytes_per_second, {digits: 0}) + '/s',
            align: 'right',
            fontSize: 'header',
        });
    }

    getAnchorPosition({index = 0}: TAnchor) {
        const {length = 0} = this.state.anchors;

        const {width} = this.getGeometry();
        const step = width / (length + 1);

        return {y: 0, x: step * (index + 1)};
    }

    renderAnchor: YTGraphCanvasBlock<FlowGraphBlockItem<'computation'>>['renderAnchor'] = () => {
        return NoopComponent.create();
    };
}
