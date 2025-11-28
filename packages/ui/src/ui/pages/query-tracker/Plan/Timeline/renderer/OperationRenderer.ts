import {yaTimelineConfig} from '../../../../../packages/ya-timeline';
import {Hitbox} from '../../../../../packages/ya-timeline/components/Events/AbstractEventRenderer';
import {duration as calcDuration} from '../../utils';
import {AbstractEventRenderer, TimelineEvent} from '@gravity-ui/timeline';
import {OperationTimeline} from '../utils';

const GROUP_HEIGHT = 16;
const MIN_EVENT_WIDTH = 4;
const GROUP_BORDER_THICKNESS = 2;
const TRIANGLE_HEIGHT = 5;
const TRIANGLE_WIDTH = 10;

function renderEventDuration(
    ctx: CanvasRenderingContext2D,
    duration: string,
    x: number,
    y: number,
): void {
    ctx.fillStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.COUNTER_FONT_COLOR);
    ctx.fillText(
        duration,
        x + yaTimelineConfig.COUNTER_PADDING,
        y + yaTimelineConfig.COUNTER_FONT_CENTER_OFFSET,
    );
}

function calcDurationFormat(from?: number, to?: number) {
    if (!from || !to) {
        return undefined;
    }
    if (to - from === 0) {
        return `0s`;
    }
    if (to - from < 1000) {
        return `<1s`;
    }
    return calcDuration(from, to, 'h:mm:ss');
}

interface RenderTriangleProps {
    ctx: CanvasRenderingContext2D;
    x0: number;
    y0: number;
    width: number;
    height: number;
    color: string;
}

function renderTriangles({ctx, x0, y0, width, height, color}: RenderTriangleProps) {
    const halfBorderThickness = GROUP_BORDER_THICKNESS / 2;

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.lineTo(x0 - halfBorderThickness, y0 + height + TRIANGLE_HEIGHT + halfBorderThickness);
    ctx.lineTo(x0 + TRIANGLE_WIDTH, y0 + height + halfBorderThickness);
    ctx.lineTo(x0 - halfBorderThickness, y0 + height + halfBorderThickness);
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(
        x0 + width + halfBorderThickness,
        y0 + height + TRIANGLE_HEIGHT + halfBorderThickness,
    );
    ctx.lineTo(x0 + width - TRIANGLE_WIDTH, y0 + height + halfBorderThickness);
    ctx.lineTo(x0 + width + halfBorderThickness, y0 + height + halfBorderThickness);
    ctx.fill();
}

export class OperationRenderer extends AbstractEventRenderer {
    render(
        ctx: CanvasRenderingContext2D,
        event: OperationTimeline,
        isSelected: boolean,
        x0: number,
        x1: number,
        y: number,
        _: number,
    ) {
        const y0 = y - GROUP_HEIGHT / 2;
        const width = Math.max(x1 - x0, MIN_EVENT_WIDTH);
        const height = GROUP_HEIGHT;
        const duration = calcDurationFormat(event.from, event.to);
        let progress = x0;

        let totalWidth = 0;

        if (event.trackIndex === 0 && Object.keys(event.colors).length > 1) {
            for (let i = 1; i < Object.keys(event.colors).length; i++) {
                let eventWidth = width * event.colors[i].percentage;
                if (i === Object.keys(event.colors).length - 1) {
                    eventWidth = Math.max(width * event.colors[i].percentage, MIN_EVENT_WIDTH);
                }
                ctx.fillStyle = yaTimelineConfig.resolveCssValue(event.colors[i].color);
                ctx.fillRect(progress, y0, eventWidth, height);
                progress += eventWidth;
                totalWidth += eventWidth;
            }
            if (event.eventsCount === 1 && event.borderColor) {
                renderTriangles({
                    ctx,
                    x0,
                    y0,
                    width: totalWidth || width,
                    height,
                    color: yaTimelineConfig.resolveCssValue(event.borderColor),
                });

                ctx.strokeStyle = yaTimelineConfig.resolveCssValue(event.borderColor);
                ctx.lineWidth = GROUP_BORDER_THICKNESS;
                ctx.strokeRect(x0, y0, totalWidth || width, height);

                if (event.backgroundColor && event.isExpanded) {
                    const backgroundMargin = (yaTimelineConfig.TRACK_HEIGHT - height) / 3;
                    ctx.fillStyle = yaTimelineConfig.resolveCssValue(event.backgroundColor);
                    ctx.fillRect(
                        x0 - backgroundMargin,
                        y0 - backgroundMargin,
                        (totalWidth || width) + backgroundMargin * 2,
                        yaTimelineConfig.TRACK_HEIGHT * Object.keys(event.colors).length -
                            backgroundMargin,
                    );
                }
            }
        } else {
            const color = event.colors[event.trackIndex]?.color;
            ctx.fillStyle = yaTimelineConfig.resolveCssValue(color);

            ctx.fillRect(x0, y0, width, height);
        }
        if (isSelected) {
            ctx.strokeStyle = yaTimelineConfig.resolveCssValue(
                yaTimelineConfig.SELECTION_OUTLINE_COLOR,
            );
            ctx.lineWidth = yaTimelineConfig.SELECTION_OUTLINE_THICKNESS;
            ctx.strokeRect(x0, y0, totalWidth || width, height);
        }
        if (duration) {
            renderEventDuration(ctx, duration, x0 + Math.max(totalWidth, width), y);
        }
    }

    getHitbox(_event: TimelineEvent, x0: number, x1: number): Hitbox {
        this.hitboxResult.left = x0;
        this.hitboxResult.right = x0 + Math.max(x1 - x0, MIN_EVENT_WIDTH);
        return this.hitboxResult;
    }
}
