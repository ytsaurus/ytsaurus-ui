import {ECameraScaleLevel} from '@gravity-ui/graph';

import {YTGraphBlock, YTGraphCanvasBlock} from '../../../../components/YTGraph';

import {type NodeDetails, NodeProgress} from '../models/plan';
import {OperationSchemas} from '../utils';
import {GRAPH_COLORS} from '../../../../components/YTGraph/constants';
import {getCssColor} from '../../../../utils/get-css-color';
import {getBlockTypeByState, isProgressState} from './helpers/getBlockTypeByState';
import {OperationType} from './enums';

export type QueriesBlockMeta = {
    level: ECameraScaleLevel;
    operationType: OperationType;
    nodeProgress?: NodeProgress;
    schemas?: OperationSchemas;
    details?: NodeDetails;

    icon: {
        src: string;
        height?: number;
        width?: number;
    };
    bottomText?: string;
    tablePath?: string;
    textSize?: number;
    padding?: number;
};

export type ZoomMode = 'minimalistic' | 'schematic' | 'detailed';
export type QueriesNodeBlock = YTGraphBlock<string, QueriesBlockMeta>;

// Status icon sizing ratios for circle nodes
const STATUS_ICON_SIZE_RATIO = 1 / 4;
const STATUS_ICON_BG_RADIUS_RATIO = 1 / 6;

// Arc width constants
const ARC_WIDTH = 2;
const PROGRESS_ARC_WIDTH_RATIO = 1 / 9;
const INNER_BORDER_WIDTH_RATIO = 1 / 25;

// Bottom text layout ratios
const BOTTOM_TEXT_OFFSET_RATIO = 1 / 5;
const BOTTOM_TEXT_WIDTH_RATIO = 2;

// Font sizes for text rendering
const BOTTOM_TEXT_FONT_SIZE = 62;
const COUNTER_FONT_SIZE = 52;
const COUNTER_FONT_SIZE_MINIMALISTIC = 62;

export class QueriesCanvasBlock extends YTGraphCanvasBlock<QueriesNodeBlock> {
    override renderDetailedView() {
        this.renderBlock('schematic');
    }

    override renderBlock(mode: ZoomMode) {
        if (this.isTable()) {
            this.drawBorder({});
        } else {
            this.drawCircleBorder();
        }
        this.renderContent(mode);
        this.drawJobCounter(mode);
    }

    protected isTable() {
        return this.state.name.toLowerCase() === 'table';
    }

    protected drawCircleBorder() {
        const {x, y, width, height, meta} = this.state;
        const style = getBlockTypeByState(meta.nodeProgress?.state);
        const {borderColor, backgroundColor, borderType, icon} = style;
        const containerBackgroundColor = getCssColor('--g-color-base-background');
        const arcX = x + width / 2;
        const arcY = y + height / 2;
        const arcRadius = width / 2;
        const progressArcWidth = width * PROGRESS_ARC_WIDTH_RATIO;

        const ctx = this.context.ctx;
        const progressPercent = this.getProgressPercent();
        const progressStartAngle = -0.5 * Math.PI;
        const progressEndAngle = progressStartAngle + 2 * Math.PI * progressPercent;
        const showProgress = isProgressState(style);

        // background
        ctx.beginPath();
        ctx.arc(
            arcX,
            arcY,
            arcRadius - (showProgress ? progressArcWidth / 2 : 0),
            progressEndAngle || 0,
            progressStartAngle + 2 * Math.PI,
        );
        ctx.lineTo(arcX, arcY);
        ctx.closePath();
        if (backgroundColor) {
            ctx.fillStyle = backgroundColor;
            ctx.fill();
        }

        // draw border
        ctx.beginPath();
        ctx.arc(arcX, arcY, arcRadius, 0, 2 * Math.PI);
        ctx.closePath();
        if (borderType === 'dashed') {
            ctx.setLineDash([4, 4]);
        }
        ctx.lineWidth = showProgress ? progressArcWidth : ARC_WIDTH;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
        ctx.setLineDash([]);

        // draw progress
        if (showProgress) {
            ctx.beginPath();
            ctx.arc(arcX, arcY, arcRadius, progressStartAngle, progressEndAngle);
            ctx.lineWidth = progressArcWidth;
            ctx.strokeStyle = style.progressColors.progressBorder;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(
                arcX,
                arcY,
                arcRadius - progressArcWidth / 2,
                progressStartAngle,
                progressEndAngle,
            );
            ctx.lineTo(arcX, arcY);
            ctx.closePath();
            ctx.fillStyle = style.progressColors.progress;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(arcX, arcY, arcRadius - progressArcWidth / 2, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.lineWidth = width * INNER_BORDER_WIDTH_RATIO;
            ctx.strokeStyle = containerBackgroundColor;
            ctx.stroke();
        }

        // draw icon
        if (!icon) return;
        const iconSide = width * STATUS_ICON_SIZE_RATIO;
        const iconBgRadius = width * STATUS_ICON_BG_RADIUS_RATIO;

        ctx.beginPath();
        ctx.arc(x + width - iconSide / 2, y + iconSide / 2, iconBgRadius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = containerBackgroundColor;
        ctx.fill();

        this.drawIcon(icon, x + width - iconSide, y, iconSide, iconSide);
    }

    protected drawBottomText(bottomText?: string) {
        if (!bottomText) return;

        const maxTextWidth = this.state.width * 3 - this.state.width * BOTTOM_TEXT_OFFSET_RATIO;

        this.context.ctx.fillStyle = this.context.colors.block?.text || GRAPH_COLORS.text;
        this.context.ctx.textAlign = 'center';
        const {fitText} = this.fitText(
            maxTextWidth,
            bottomText,
            BOTTOM_TEXT_FONT_SIZE,
            this.isTable() ? 'start' : 'end',
        );

        this.renderText(fitText, this.context.ctx, {
            rect: {
                x: this.state.x - this.state.width / 2,
                y: this.state.y + this.state.height + this.state.height * BOTTOM_TEXT_OFFSET_RATIO,
                width: this.state.width * BOTTOM_TEXT_WIDTH_RATIO,
                height: this.state.height * (1 - BOTTOM_TEXT_OFFSET_RATIO),
            },
            renderParams: {
                font: this.getFont(BOTTOM_TEXT_FONT_SIZE),
                wordWrap: false,
            },
        });
    }

    protected drawCounter(total: number, mode?: ZoomMode) {
        const {x, y, height, width} = this.state;

        const counterX = x + width / 2;
        const counterY = y + height / 2;
        const totalString = total.toString();

        this.context.ctx.fillStyle = getCssColor('--g-color-text-primary');
        this.context.ctx.textAlign = 'center';
        this.context.ctx.textBaseline = 'middle';
        this.context.ctx.font = this.getFont(
            mode === 'minimalistic' ? COUNTER_FONT_SIZE_MINIMALISTIC : COUNTER_FONT_SIZE,
        );
        this.context.ctx.fillText(totalString, counterX, counterY);
    }

    private getProgressPercent() {
        const nodeProgress = this.state.meta.nodeProgress;
        if (!nodeProgress || !nodeProgress.total || nodeProgress?.state !== 'InProgress') return 0;

        return (nodeProgress.completed || 0) / nodeProgress.total;
    }

    private renderContent(mode: ZoomMode) {
        const {height, width, x, y} = this.state;
        const showBottomText = mode === 'schematic' || mode === 'minimalistic';

        if (showBottomText) {
            this.drawBottomText(this.state.meta.bottomText || this.state.name);
        }
        if (!this.state.meta.nodeProgress?.state) {
            const iconSide = width / 2;
            this.drawIcon(
                this.state.meta.icon?.src,
                x + width / 2 - iconSide / 2,
                y + height / 2 - iconSide / 2,
                iconSide,
                iconSide,
            );
        }
    }

    private getJobCount() {
        const nodeProgress = this.state.meta.nodeProgress;
        if (!nodeProgress || !nodeProgress.total) return undefined;

        return nodeProgress.total + (nodeProgress.aborted || 0);
    }

    private drawJobCounter(mode: ZoomMode) {
        const total = this.getJobCount();
        if (total === undefined) return;

        this.drawCounter(total, mode);
    }
}
