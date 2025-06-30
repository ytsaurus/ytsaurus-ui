import {ECameraScaleLevel} from '@gravity-ui/graph';

import {YTGrapCanvasBlock, YTGraphBlock} from '../../../../components/YTGraph';

import {type NodeDetails, NodeProgress} from '../models/plan';
import {OperationSchemas} from '../utils';

export type QueriesBlockMeta = {
    level: ECameraScaleLevel;
    nodeProgress?: NodeProgress;
    schemas?: OperationSchemas;
    details?: NodeDetails;

    icon: {
        src: string;
        height?: number;
        width?: number;
    };
    bottomText?: string;
    textSize?: number;
    padding?: number;
};

export type QueriesNodeBlock = YTGraphBlock<string, QueriesBlockMeta>;

const DEFAULT_CONTENT_OFFSET = 10;
const DEFAULT_ICON_OFFSET = 20;

const ICON_SIZE = 24;
const TEXT_SIZE = 14;

export class QueriesCanvasBlock extends YTGrapCanvasBlock<QueriesNodeBlock> {
    icon: null | HTMLImageElement = null;

    override renderDetailedView() {
        this.renderBlock('schematic');
    }

    override renderBlock(mode: 'minimalistic' | 'schematic') {
        this.drawBorder({
            progressPercent: this.getProgressPercent(),
            inProgress: this.checkNodeProgress(),
        });
        this.renderContent(mode);
        this.drawJobCounter();
    }

    private getProgressPercent() {
        const nodeProgress = this.state.meta.nodeProgress;
        if (this.state.meta.nodeProgress?.state === 'Finished') return 1;
        if (!nodeProgress || !nodeProgress.total) return 0;

        return (nodeProgress.completed || 0) / nodeProgress.total;
    }

    private checkNodeProgress() {
        const {nodeProgress} = this.state.meta;
        return (
            Boolean(nodeProgress?.state) && ['Started', 'InProgress'].includes(nodeProgress?.state!)
        );
    }

    private renderContent(mode: 'minimalistic' | 'schematic') {
        const {height, width, x, y} = this.state;
        const padding = this.state.meta.padding || 0;
        const textSize = this.state.meta.textSize ?? TEXT_SIZE;
        const {iconWidth, iconHeight} = iconSizes(this.state.meta);
        const isSchematic = mode === 'schematic';

        let textHeight = 0;
        if (isSchematic) {
            const contentWidth = width - padding * 2;
            const textWidth = this.context.ctx.measureText(this.state.name).width;
            const numLines = Math.ceil(textWidth / contentWidth);
            textHeight = numLines * textSize;
        }

        const contentHeight = textHeight + DEFAULT_CONTENT_OFFSET + iconHeight;
        const startYPosition = (height - contentHeight) / 2;

        if (isSchematic) {
            this.drawInnerText({
                text: this.state.name,
                yPos: startYPosition + DEFAULT_CONTENT_OFFSET + iconHeight,
            });
            this.drawBottomText(this.state.meta.bottomText);

            this.drawIcon(
                this.state.meta.icon?.src,
                x + (width - iconWidth) / 2,
                y + startYPosition,
                iconWidth,
                iconHeight,
            );
        } else {
            this.drawIcon(
                this.state.meta.icon?.src,
                x + DEFAULT_ICON_OFFSET,
                y + DEFAULT_ICON_OFFSET,
                width - DEFAULT_ICON_OFFSET * 2,
                height - DEFAULT_ICON_OFFSET * 2,
            );
        }
    }

    private drawJobCounter() {
        const nodeProgress = this.state.meta.nodeProgress;
        if (!nodeProgress || !nodeProgress.total) return;

        const total = nodeProgress.total + (nodeProgress.aborted || 0);

        this.drawCounter(total);
    }
}

function iconSizes(meta: QueriesBlockMeta) {
    return {
        iconWidth: meta.icon?.width ?? ICON_SIZE,
        iconHeight: meta.icon?.height ?? ICON_SIZE,
    };
}
