import React from 'react';

import FileCodeIcon from '@gravity-ui/icons/svgs/file-code.svg';

import format from '../../../../../../common/hammer/format';

import {YTGrapCanvasBlock} from '../../../../../../components/YTGraph';
import {FlowGraphBlockItem} from '../FlowGraph';

const PADDING = 10;

export class StreamCanvasBlock extends YTGrapCanvasBlock<FlowGraphBlockItem<'stream'>> {
    renderBlock(_mode: 'minimalistic' | 'schematic'): void {
        this.drawBorder({});
        this.renderHeader();
    }

    renderHeader() {
        const w = 24;
        this.drawInnerIcon({src: <FileCodeIcon />, xPos: PADDING, yPos: PADDING, w, h: w});

        const yPos = PADDING;
        const xPos = PADDING + w + 2;

        this.drawInnerText({
            yPos,
            xPos,
            text: this.state.name,
            fontSize: 'header2',
            padding: PADDING,
        });

        this.drawInnerText({
            yPos: yPos + 30,
            xPos,
            text: format.Bytes(this.state.meta.bytes_per_second) + '/s',
            align: 'right',
            fontSize: 'header',
        });
    }
}
