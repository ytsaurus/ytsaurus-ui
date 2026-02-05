import {CanvasBlock} from '@gravity-ui/graph';
import {GRAPH_BACKGROUND_COLORS, GRAPH_COLORS} from '../constants';
import {YTGraphBlock} from '../types';
import {svgDataToBase} from '../utils/iconToBase';
import {SVGIconSvgrData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

export const DEFAULT_PADDING = 10;

const COUNTER_PADDING = 10;
const COUNTER_RADIUS = 4;

const FONT_SIZE = {
    detailed_normal: 14,
    detailed_header: 18,
    detailed_header2: 24,
    schematic_normal: 18,
    schematic_header: 24,
    schematic_header2: 32,
    minimalistic_normal: 28,
    minimalistic_header: 44,
    minimalistic_header2: 62,
};

const ELLIPSIS_CHAR = '\u2026';

export type YTGraphFontSize = 'normal' | 'header' | 'header2' | number;

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

type ZoomMode = 'minimalistic' | 'schematic' | 'detailed';

export class YTGraphCanvasBlock<T extends YTGraphBlock<string, {}>> extends CanvasBlock<T> {
    icon: null | HTMLImageElement = null;
    iconSrc: null | string = null;

    zoomLevel: ZoomMode = 'detailed';

    override renderMinimalisticBlock() {
        this.zoomLevel = 'minimalistic';
        this.renderBlock('minimalistic');
    }

    override renderSchematicView() {
        this.zoomLevel = 'schematic';
        this.renderBlock('schematic');
    }

    override renderDetailedView() {
        this.zoomLevel = 'detailed';
        this.renderBlock('detailed');
    }

    renderBlock(_mode: ZoomMode) {
        this.drawBorder({});
        this.drawInnerText({
            text: this.state.name,
            fontSize: 'header2',
        });
    }

    getGeometry() {
        return this.connectedState.$geometry.value;
    }

    protected getFontHeight(type: YTGraphFontSize): number {
        if (typeof type === 'number') {
            return type;
        }

        const mode_type = `${this.zoomLevel}_${type}` as const;
        return FONT_SIZE[mode_type];
    }

    protected getFont(type: YTGraphFontSize = 'normal') {
        return `normal ${this.getFontHeight(type)}px YS Text, Arial, sans-serif`;
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

        if (this.icon && this.iconSrc === src) {
            this.context.ctx.drawImage(this.icon, iconX, iconY, iconWidth, iconHeight);
        } else {
            try {
                this.icon = await this.loadImage(src);
                this.iconSrc = src;
                this.context.ctx.drawImage(this.icon, iconX, iconY, iconWidth, iconHeight);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Failed to load image:', error);
            }
        }
    }

    protected async drawCenteredIcon({
        padding = DEFAULT_PADDING,
        size,
        ...icon
    }: {size?: number; padding?: number} & IconSrc) {
        const {width, height} = this.state;
        const iconSize = size ?? Math.min(width, height) - padding * 2;

        this.drawInnerIcon({
            ...icon,
            xPos: Math.round(width / 2 - iconSize / 2),
            yPos: Math.round(height / 2 - iconSize / 2),
            w: iconSize,
            h: iconSize,
        });
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
        backgroundTheme,
    }: Pick<RoundedBlockProps, 'inProgress' | 'progressPercent'> & Pick<T, 'backgroundTheme'>) {
        const {x, y, height, width} = this.state;

        const bgColorByTheme = backgroundTheme
            ? GRAPH_BACKGROUND_COLORS[backgroundTheme]
            : undefined;

        this.drawRoundBlock({
            x,
            y,
            width,
            height,
            radius: 8,
            selected: this.state.selected,
            background: {
                default:
                    bgColorByTheme ??
                    (this.context.colors.block?.background || GRAPH_COLORS.background),
                selected: bgColorByTheme ?? GRAPH_COLORS.selectedBackground,
                active: bgColorByTheme ?? GRAPH_COLORS.progressColor,
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

        const blockHeight = textHeight + COUNTER_PADDING * 2;
        const blockWidth = textMetrics.width + COUNTER_PADDING * 2;
        const blockX = x - blockWidth / 2;
        const blockY = y - blockHeight / 2;

        this.context.ctx.beginPath();
        this.context.ctx.roundRect(blockX, blockY, blockWidth, blockHeight, COUNTER_RADIUS);
        this.context.ctx.closePath();
        this.context.ctx.fillStyle = GRAPH_COLORS.jobBlockBackground;
        this.context.ctx.fill();

        this.context.ctx.fillStyle = GRAPH_COLORS.jobBlockColor;
        this.context.ctx.textAlign = 'center';
        this.context.ctx.textBaseline = 'top';
        this.context.ctx.fillText(total.toString(), x, y - textHeight / 2);
    }

    protected fitText(
        maxWidth: number,
        text: string,
        fontSize: YTGraphFontSize = 'normal',
        truncateFrom: 'start' | 'end' = 'end',
    ) {
        this.context.ctx.font = this.getFont(fontSize);

        let width = Infinity;
        let res = text;
        while (width > maxWidth && res.length > 0) {
            width = this.context.ctx.measureText(res).width;
            if (width <= maxWidth) {
                break;
            }

            const cw = width / res.length;
            const newLength = Math.floor(maxWidth / cw);
            if (truncateFrom === 'end') {
                res = res.slice(0, newLength);
            } else {
                res = res.slice(-newLength);
            }
        }

        const isSameText = res === text;

        if (!isSameText) {
            if (truncateFrom === 'end') {
                res = res.slice(0, res.length - 1) + ELLIPSIS_CHAR;
            } else {
                res = ELLIPSIS_CHAR + res.slice(1);
            }
        }

        const height: number = this.getFontHeight(fontSize);

        return {
            fitText: res,
            fitTextWidth: isSameText ? width : this.context.ctx.measureText(res).width,
            height,
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
            fontSize,
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
