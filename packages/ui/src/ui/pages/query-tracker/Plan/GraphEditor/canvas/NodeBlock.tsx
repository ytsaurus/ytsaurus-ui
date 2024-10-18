import {CanvasBlock, TBlock} from '@gravity-ui/graph';
import {type NodeDetails, NodeProgress} from '../../models/plan';
import {GRAPH_COLORS} from '../constants';
import {ScaleStep} from '../enums';
import {OperationSchemas} from '../../utils';

const DEFAULT_CONTENT_OFFSET = 10;

export type NodeBlockMeta = {
    scale: ScaleStep;
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

export class NodeBlock extends CanvasBlock<NodeTBlock> {
    icon: null | HTMLImageElement = null;

    override renderMinimalisticBlock() {
        this.renderBlock('minimalistic');
    }

    override renderSchematicView() {
        this.renderBlock('schematic');
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

    private getScalePercent() {
        return 1 / this.state.meta.scale;
    }

    private getFont() {
        return `normal ${this.state.meta.textSize}px YS Text, Arial, sans-serif`;
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
        ctx.lineWidth = borderWidth;
        ctx.stroke();

        if (progressPercent) {
            ctx.beginPath();
            ctx.roundRect(x, y, width * progressPercent, height, radius);
            ctx.closePath();
            ctx.fillStyle = background.active;
            ctx.fill();
        }
    }

    private async drawIcon(blockWidth: number, startYPosition: number) {
        const {src, height, width} = this.state.meta.icon;
        const {x, y} = this.state;
        const iconX = x + (blockWidth - width) / 2;
        const iconY = y + startYPosition;

        if (this.icon) {
            this.context.ctx.drawImage(this.icon, iconX, iconY, width, height);
        } else {
            try {
                this.icon = await this.loadImage(src);
                this.context.ctx.drawImage(this.icon, iconX, iconY, width, height);
            } catch (error) {
                console.error('Failed to load image:', error);
            }
        }
    }

    private drawBottomText() {
        if (!this.state.meta.bottomText) return;

        this.context.ctx.fillStyle = '#000000D9';
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

        this.context.ctx.fillStyle = GRAPH_COLORS.text;
        this.context.ctx.textAlign = 'center';
        this.renderText(this.state.name, this.context.ctx, {
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
        const scaledPercent = this.getScalePercent();
        const padding = 5 * scaledPercent;
        const {x, y} = this.state;

        const textMetrics = this.context.ctx.measureText(total.toString());
        const blockWidth = textMetrics.width + padding * 2;
        const blockHeight = 16 * scaledPercent;
        const blockX = x - blockWidth / 2;
        const blockY = y - blockHeight / 2;
        const radius = 4 * scaledPercent;

        this.context.ctx.beginPath();
        this.context.ctx.roundRect(blockX, blockY, blockWidth, blockHeight, radius);
        this.context.ctx.closePath();
        this.context.ctx.fillStyle = GRAPH_COLORS.jobBlockBackground;
        this.context.ctx.fill();

        this.context.ctx.fillStyle = GRAPH_COLORS.jobBlockColor;
        this.context.ctx.textAlign = 'center';
        this.context.ctx.textBaseline = 'top';
        this.context.ctx.fillText(total.toString(), x, blockY + 3.5 * scaledPercent);
    }

    private renderContent(showInnerText = true) {
        const {height, width} = this.state;
        const padding = this.state.meta.padding || 0;
        const textSize = this.state.meta.textSize;
        const iconHeight = this.state.meta.icon.height;

        let textHeight = 0;
        if (showInnerText) {
            const contentWidth = width - padding * 2;
            const textWidth = this.context.ctx.measureText(this.state.name).width;
            const numLines = Math.ceil(textWidth / contentWidth);
            textHeight = numLines * textSize;
        }

        const contentHeight = textHeight + DEFAULT_CONTENT_OFFSET + iconHeight;
        const startYPosition = (height - contentHeight) / 2;

        this.drawIcon(width, startYPosition);
        if (showInnerText) this.drawInnerText(startYPosition + DEFAULT_CONTENT_OFFSET + iconHeight);
        this.drawBottomText();
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
        const scalePercent = this.getScalePercent();

        this.drawRoundBlock({
            x,
            y,
            width,
            height,
            radius: 8 * scalePercent,
            selected: this.state.selected,
            background: {
                default: GRAPH_COLORS.background,
                selected: GRAPH_COLORS.selectedBackground,
                active: GRAPH_COLORS.progressColor,
            },
            borderWidth: scalePercent,
            borderColor: {
                default: GRAPH_COLORS.border,
                selected: GRAPH_COLORS.selectedBorder,
                active: GRAPH_COLORS.progressBorder,
            },
            progressPercent: this.getProgressPercent(),
        });
        this.renderContent(mode === 'schematic');
    }
}
