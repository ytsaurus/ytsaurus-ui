import {CanvasBlock, ECameraScaleLevel, TBlock} from '@gravity-ui/graph';
import {type NodeDetails, NodeProgress} from '../../models/plan';
import {GRAPH_COLORS} from '../constants';
import {OperationSchemas} from '../../utils';

const DEFAULT_CONTENT_OFFSET = 10;
const DEFAULT_ICON_OFFSET = 20;

const JOB_COUNTER_FONT_SIZE = 18;
const JOB_COUNTER_PADDING = 10;
const JOB_COUNTER_BLOCK_HEIGHT = 30;
const JOB_COUNTER_RADIUS = 4;

export type NodeBlockMeta = {
    level: ECameraScaleLevel;
    icon: {
        src: string;
        height: number;
        width: number;
    };
    bottomText?: string;
    textSize: number;
    padding?: number;
    nodeProgress?: NodeProgress;
    schemas?: OperationSchemas;
    details?: NodeDetails;
};

export type NodeTBlock = Omit<TBlock, 'meta'> & {meta: NodeBlockMeta};

type RoundedBlockProps = {
    x: number;
    y: number;
    height: number;
    width: number;
    radius: number;
    selected: boolean;
    background: {
        default: string;
        selected: string;
        active: string;
    };
    borderWidth: number;
    borderColor: {
        default: string;
        selected: string;
        active: string;
    };
    progressPercent: number;
};

const MAX_TEXT_LENGTH = 16;

export class NodeBlock extends CanvasBlock<NodeTBlock> {
    icon: null | HTMLImageElement = null;

    override renderMinimalisticBlock() {
        this.renderBlock('minimalistic');
    }

    override renderSchematicView() {
        this.renderBlock('schematic');
    }

    override renderDetailedView() {
        this.renderBlock('schematic');
    }

    getGeometry() {
        return this.connectedState.$geometry.value;
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
            nodeProgress &&
            nodeProgress.state &&
            ['Started', 'InProgress'].includes(nodeProgress.state)
        );
    }

    private getFont(fontSize = this.state.meta.textSize) {
        return `normal ${fontSize}px YS Text, Arial, sans-serif`;
    }

    private drawRoundBlock({
        x,
        y,
        height,
        width,
        radius,
        background,
        borderColor,
        borderWidth,
        selected,
        progressPercent,
    }: RoundedBlockProps) {
        const blockType = selected ? 'selected' : 'default';

        const ctx = this.context.ctx;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.closePath();
        ctx.fillStyle = background[blockType];
        ctx.fill();

        ctx.strokeStyle = this.checkNodeProgress() ? borderColor.active : borderColor[blockType];
        ctx.lineWidth = this.checkNodeProgress() ? borderWidth + 2 : borderWidth;
        ctx.stroke();

        if (progressPercent) {
            const halfBorderWidth = borderWidth / 2;
            ctx.beginPath();
            ctx.roundRect(
                x + halfBorderWidth,
                y + halfBorderWidth,
                width * progressPercent - borderWidth,
                height - borderWidth,
                radius,
            );
            ctx.closePath();
            ctx.fillStyle = background.active;
            ctx.fill();
        }
    }

    private async drawIcon(
        src: string,
        iconX: number,
        iconY: number,
        iconWidth: number,
        iconHeight: number,
    ) {
        if (this.icon) {
            this.context.ctx.drawImage(this.icon, iconX, iconY, iconWidth, iconHeight);
        } else {
            try {
                this.icon = await this.loadImage(src);
                this.context.ctx.drawImage(this.icon, iconX, iconY, iconWidth, iconHeight);
            } catch (error) {
                console.error('Failed to load image:', error);
            }
        }
    }

    private drawBottomText() {
        if (!this.state.meta.bottomText) return;

        this.context.ctx.fillStyle = this.context.colors.block?.text || GRAPH_COLORS.text;
        this.context.ctx.textAlign = 'center';
        this.renderText(this.state.meta.bottomText, this.context.ctx, {
            rect: {
                x: this.state.x - this.state.width / 2,
                y: this.state.y + this.state.height + this.state.height / 5,
                width: this.state.width * 2,
                height: this.state.height - this.state.height / 5,
            },
            renderParams: {
                font: this.getFont(),
            },
        });
    }

    private drawInnerText(yPosition: number) {
        const {height, width, x, y} = this.state;
        const padding = this.state.meta.padding || 0;
        const iconHeight = this.state.meta.icon.height;
        const name =
            this.state.name.length > MAX_TEXT_LENGTH
                ? this.state.name.slice(0, 13) + '...'
                : this.state.name;

        this.context.ctx.fillStyle = this.context.colors.block?.text || GRAPH_COLORS.text;
        this.context.ctx.textAlign = 'center';
        this.renderText(name, this.context.ctx, {
            rect: {
                x: x + padding,
                y: y + yPosition,
                width: width - padding * 2,
                height: height - iconHeight - DEFAULT_CONTENT_OFFSET,
            },
            renderParams: {
                font: this.getFont(),
            },
        });
    }

    private drawJobCounter() {
        const nodeProgress = this.state.meta.nodeProgress;
        if (!nodeProgress || !nodeProgress.total) return;

        const total = nodeProgress.total + (nodeProgress.aborted || 0);
        const {x, y} = this.state;

        this.context.ctx.font = this.getFont(JOB_COUNTER_FONT_SIZE);
        const textMetrics = this.context.ctx.measureText(total.toString());
        const textHeight =
            textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        const blockWidth = textMetrics.width + JOB_COUNTER_PADDING * 2;
        const blockX = x - blockWidth / 2;
        const blockY = y - JOB_COUNTER_BLOCK_HEIGHT / 2;

        this.context.ctx.beginPath();
        this.context.ctx.roundRect(
            blockX,
            blockY,
            blockWidth,
            JOB_COUNTER_BLOCK_HEIGHT,
            JOB_COUNTER_RADIUS,
        );
        this.context.ctx.closePath();
        this.context.ctx.fillStyle = GRAPH_COLORS.jobBlockBackground;
        this.context.ctx.fill();

        this.context.ctx.fillStyle = GRAPH_COLORS.jobBlockColor;
        this.context.ctx.textAlign = 'center';
        this.context.ctx.textBaseline = 'top';
        this.context.ctx.fillText(total.toString(), x, y - textHeight / 2);
    }

    private renderContent(mode: 'minimalistic' | 'schematic') {
        const {height, width, x, y} = this.state;
        const padding = this.state.meta.padding || 0;
        const textSize = this.state.meta.textSize;
        const iconHeight = this.state.meta.icon.height;
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
            this.drawInnerText(startYPosition + DEFAULT_CONTENT_OFFSET + iconHeight);
            this.drawBottomText();

            this.drawIcon(
                this.state.meta.icon.src,
                x + (width - this.state.meta.icon.width) / 2,
                y + startYPosition,
                this.state.meta.icon.width,
                this.state.meta.icon.height,
            );
        } else {
            this.drawIcon(
                this.state.meta.icon.src,
                x + DEFAULT_ICON_OFFSET,
                y + DEFAULT_ICON_OFFSET,
                width - DEFAULT_ICON_OFFSET * 2,
                height - DEFAULT_ICON_OFFSET * 2,
            );
        }

        this.drawJobCounter();
    }

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    private renderBlock(mode: 'minimalistic' | 'schematic') {
        const {height, width} = this.state;
        const {x, y} = this.state;

        this.drawRoundBlock({
            x,
            y,
            width,
            height,
            radius: 8,
            selected: this.state.selected,
            background: {
                default: this.context.colors.block?.background || GRAPH_COLORS.background,
                selected: GRAPH_COLORS.selectedBackground,
                active: GRAPH_COLORS.progressColor,
            },
            borderWidth: 2,
            borderColor: {
                default: this.context.colors.block?.border || GRAPH_COLORS.border,
                selected: this.context.colors.block?.selectedBorder || GRAPH_COLORS.selectedBorder,
                active: GRAPH_COLORS.progressBorder,
            },
            progressPercent: this.getProgressPercent(),
        });
        this.renderContent(mode);
    }
}
