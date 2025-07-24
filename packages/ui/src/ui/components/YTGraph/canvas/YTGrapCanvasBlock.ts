import {CanvasBlock} from '@gravity-ui/graph';
import {GRAPH_COLORS} from '../constants';
import {YTGraphBlock} from '../YTGraph';
import {svgDataToBase} from '../utils/iconToBase';
import {SVGIconSvgrData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

export const DEFAULT_PADDING = 10;

const COUNTER_PADDING = 10;
const COUNTER_BLOCK_HEIGHT = 30;
const COUNTER_RADIUS = 4;

const FONT_SIZE = {
    normal: 14,
    header: 18,
    header2: 24,
};

const ELLIPSIS_CHAR = '\u2026';

export type YTGraphFontSize = keyof typeof FONT_SIZE;

export type BaseMeta = {};

type IconSrc =
    | {src: string; currentColor?: undefined}
    | {src?: SVGIconSvgrData; currentColor?: string};

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

export class YTGrapCanvasBlock<T extends YTGraphBlock<string, {}>> extends CanvasBlock<T> {
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
        this.drawInnerText({
            text: this.state.name,
            fontSize: 'header2',
        });
    }

    getGeometry() {
        return this.connectedState.$geometry.value;
    }

    protected getFont(type: YTGraphFontSize = 'normal') {
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

    protected async drawInnerIcon({
        xPos,
        yPos,
        w,
        h,
        ...icon
    }: {
        xPos: number;
        yPos: number;
        w: number;
        h: number;
    } & IconSrc) {
        if (!icon.src) {
            return;
        }

        const {x, y} = this.state;

        const source =
            'string' === typeof icon.src ? icon.src : svgDataToBase(icon.src, icon.currentColor);

        return this.drawIcon(source, x + xPos, y + yPos, w, h);
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
        yPos = DEFAULT_PADDING,
        xPos,
        padding = DEFAULT_PADDING,
        fontSize,
        color,
        align,
        oneLine,
    }: {
        text: string;
        yPos?: number;
        xPos?: number;
        padding?: number;
        fontSize?: YTGraphFontSize;
        color?: 'secondary';
        align?: 'left' | 'right' | 'center';
        oneLine?: boolean;
    }) {
        const {height, width, x, y} = this.state;
        const textAreaWidth = xPos ? width - xPos - padding : width - 2 * padding;

        const {
            fitText: name,
            fitTextWidth,
            height: fitHeight,
        } = this.fitText(textAreaWidth, text, fontSize);

        const rect = {
            x: xPos === undefined ? x + padding : x + xPos,
            y: y + yPos,
            width: textAreaWidth,
            height: oneLine ? fitHeight : height - padding - yPos,
        };

        this.context.ctx.fillStyle =
            color === 'secondary'
                ? GRAPH_COLORS.secondary
                : this.context.colors.block?.text || GRAPH_COLORS.text;
        this.context.ctx.textAlign = align ?? (xPos ? 'left' : 'center');
        this.renderText(name, this.context.ctx, {
            rect,
            renderParams: {
                font: this.getFont(fontSize),
            },
        });
        return xPos !== undefined ? fitTextWidth : undefined;
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

        const textMetrics = this.measureText(total.toString(), 'header');
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

    protected fitText(maxWidth: number, text: string, fontSize: YTGraphFontSize = 'normal') {
        this.context.ctx.font = this.getFont(fontSize);

        let width = Infinity;
        let res = text;
        while (width > maxWidth) {
            width = this.context.ctx.measureText(res).width;
            if (width <= maxWidth) {
                break;
            }

            const cw = width / res.length;
            const newLength = maxWidth / cw;
            res = res.slice(0, newLength);
        }

        const isSameText = res === text;

        res = isSameText ? res : res.slice(0, res.length - 1) + ELLIPSIS_CHAR;
        return {
            fitText: res,
            fitTextWidth: isSameText ? width : this.context.ctx.measureText(res).width,
            height: FONT_SIZE[fontSize],
        };
    }

    protected measureText(text: string, fontSize?: YTGraphFontSize) {
        this.context.ctx.font = this.getFont(fontSize);
        return this.context.ctx.measureText(text);
    }

    protected drawMetaItem({
        maxWidth,
        xPos,
        yPos,
        label,
        value,
        fontSize,
        padding,
    }: {
        maxWidth: number;
        xPos: number;
        yPos: number;
        label: string;
        value: string;
        fontSize: YTGraphFontSize;
        padding?: number;
    }) {
        const l = this.fitText(maxWidth, label, fontSize);

        this.drawInnerText({
            xPos,
            yPos,
            text: l.fitText,
            color: 'secondary',
            fontSize,
            padding,
        });

        const v = this.fitText(maxWidth, value, fontSize);

        this.drawInnerText({
            xPos,
            yPos: yPos + l.height,
            text: v.fitText,
            fontSize: 'header',
            padding,
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
}
