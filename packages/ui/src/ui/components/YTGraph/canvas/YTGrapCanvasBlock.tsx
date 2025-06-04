import {CanvasBlock, TBlock} from '@gravity-ui/graph';
import {GRAPH_COLORS} from '../constants';

const DEFAULT_CONTENT_OFFSET = 10;

const ICON_SIZE = 24;

const COUNTER_PADDING = 10;
const COUNTER_BLOCK_HEIGHT = 30;
const COUNTER_RADIUS = 4;

const FONT_SIZE = {
    normal: 14,
    header: 18,
};

export type BaseMeta = {};

export type NodeTBlock<T extends BaseMeta> = Omit<TBlock, 'meta'> & {meta: T};

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
    progressPercent?: number;
    inProgress?: boolean;
};

const MAX_TEXT_LENGTH = 16;

export class YTGrapCanvasBlock<T extends NodeTBlock<BaseMeta>> extends CanvasBlock<T> {
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

    renderBlock(_mode: 'minimalistic' | 'schematic') {
        this.drawBorder({});
        this.drawInnerText({text: this.state.name});
    }

    getGeometry() {
        return this.connectedState.$geometry.value;
    }

    protected getFont(type: keyof typeof FONT_SIZE = 'normal') {
        return `normal ${FONT_SIZE[type] ?? FONT_SIZE.normal}px YS Text, Arial, sans-serif`;
    }

    protected drawRoundBlock({
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
        inProgress,
    }: RoundedBlockProps) {
        const blockType = selected ? 'selected' : 'default';

        const ctx = this.context.ctx;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.closePath();
        ctx.fillStyle = background[blockType];
        ctx.fill();

        ctx.strokeStyle = inProgress ? borderColor.active : borderColor[blockType];
        ctx.lineWidth = inProgress ? borderWidth + 2 : borderWidth;
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

    protected async drawIcon(
        src: string | undefined,
        iconX: number,
        iconY: number,
        iconWidth: number,
        iconHeight: number,
    ) {
        if (!src) {
            return;
        }

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

    protected drawBottomText(bottomText?: string) {
        if (!bottomText) return;

        this.context.ctx.fillStyle = this.context.colors.block?.text || GRAPH_COLORS.text;
        this.context.ctx.textAlign = 'center';
        this.renderText(bottomText, this.context.ctx, {
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

    protected drawInnerText({
        text,
        yPosition = DEFAULT_CONTENT_OFFSET,
        padding = DEFAULT_CONTENT_OFFSET,
        hasIcon,
    }: {
        text: string;
        yPosition?: number;
        hasIcon?: boolean;
        padding?: number;
    }) {
        const {height, width, x, y} = this.state;
        const iconHeight = hasIcon ? ICON_SIZE : 0;
        const name = text.length > MAX_TEXT_LENGTH ? text.slice(0, 13) + '...' : text;

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

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    protected drawBorder({
        inProgress,
        progressPercent,
    }: Pick<RoundedBlockProps, 'inProgress' | 'progressPercent'>) {
        const {x, y, height, width} = this.state;

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
            progressPercent,
            inProgress,
        });
    }

    protected drawCounter(total: number) {
        const {x, y} = this.state;

        this.context.ctx.font = this.getFont('header');
        const textMetrics = this.context.ctx.measureText(total.toString());
        const textHeight =
            textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        const blockWidth = textMetrics.width + COUNTER_PADDING * 2;
        const blockX = x - blockWidth / 2;
        const blockY = y - COUNTER_BLOCK_HEIGHT / 2;

        this.context.ctx.beginPath();
        this.context.ctx.roundRect(
            blockX,
            blockY,
            blockWidth,
            COUNTER_BLOCK_HEIGHT,
            COUNTER_RADIUS,
        );
        this.context.ctx.closePath();
        this.context.ctx.fillStyle = GRAPH_COLORS.jobBlockBackground;
        this.context.ctx.fill();

        this.context.ctx.fillStyle = GRAPH_COLORS.jobBlockColor;
        this.context.ctx.textAlign = 'center';
        this.context.ctx.textBaseline = 'top';
        this.context.ctx.fillText(total.toString(), x, y - textHeight / 2);
    }
}
