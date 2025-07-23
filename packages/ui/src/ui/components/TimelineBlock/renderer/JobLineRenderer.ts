import {EventDisplayMode} from '../enums';
import {convertToRGBA} from '../helpers/convertToRGBA';
import {getCssColor} from '../../../utils/get-css-color';
import {AbstractEventRenderer, TimelineEvent, ViewConfiguration} from '@gravity-ui/timeline';

export type JobPhase = {
    phase: string;
    startTime: number;
};

export type JobEvent = {
    percentage: number;
    color: string;
    state: string;
    interval: {
        from: number;
        to: number;
    };
    phases: JobPhase[];
};

export type JobLineEvent = TimelineEvent & {
    jobId: string;
    parts: JobEvent[];
    meta: {
        allocationId?: string;
        startTime: string;
        endTime?: string;
        address: string;
    };
    displayMode: EventDisplayMode;
};

const MIN_LINE_WIDTH = 8;
const DEFAULT_COLOR = '#333';
const SELECTION_OUTLINE_THICKNESS = 2;

export class JobLineRenderer extends AbstractEventRenderer {
    render(
        ctx: CanvasRenderingContext2D,
        event: JobLineEvent,
        isSelected: boolean,
        rawX0: number,
        rawX1: number,
        y: number,
        h: number,
        _: ViewConfiguration,
        timeToPosition: (t: number) => number,
    ) {
        const {displayMode, parts} = event;
        const y0 = y - h / 2;
        const {x1, x0} = this.getFixedXCoordinates(rawX0, rawX1);
        const isTransparent = displayMode === EventDisplayMode.Transparent;

        const percent = (x1 - x0) / 100;

        if (displayMode === EventDisplayMode.Found) {
            this.renderFilterBackground(ctx, x0, x1, y0, h);
        }

        let startX = x0;
        parts.forEach(({color, percentage, state, phases, interval}) => {
            const width = percentage * percent;

            if (state.toLowerCase() === 'running') {
                const phaseCount = phases.length;
                for (let i = 0; i < phaseCount; i++) {
                    const startPosition = timeToPosition(phases[i].startTime);
                    const endPosition =
                        i === phaseCount - 1
                            ? timeToPosition(interval.to)
                            : timeToPosition(phases[i + 1].startTime);
                    const isRunningPhase = phases[i].phase?.toLowerCase() === 'running';
                    const lineColor = isRunningPhase ? color : getCssColor('--purple-color');

                    ctx.beginPath();
                    ctx.fillStyle = convertToRGBA(
                        lineColor || DEFAULT_COLOR,
                        isTransparent ? 0.4 : 0.7,
                    );
                    ctx.rect(startPosition, y0, endPosition - startPosition, h);
                    ctx.fill();
                }
            } else {
                ctx.beginPath();
                ctx.fillStyle = convertToRGBA(color || DEFAULT_COLOR, isTransparent ? 0.4 : 0.7);
                ctx.rect(startX, y0, width, h);
                ctx.fill();
            }
            startX += width;
        });

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + 8, y0 + h / 2);
        ctx.lineTo(x0, y0 + h);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x1, y0);
        ctx.lineTo(x1 - 8, y0 + h / 2);
        ctx.lineTo(x1, y0 + h);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        if (isSelected) {
            this.renderSelectedBorder(ctx, x0, x1, y0, h, displayMode);
        }
    }

    renderFilterBackground(
        ctx: CanvasRenderingContext2D,
        x0: number,
        x1: number,
        y: number,
        h: number,
    ) {
        const borderThickness = SELECTION_OUTLINE_THICKNESS;

        ctx.beginPath();
        ctx.rect(
            x0 - borderThickness,
            y - borderThickness,
            x1 - x0 + borderThickness * 2,
            h + borderThickness * 2,
        );
        ctx.fillStyle = 'rgba(255, 219, 77)';
        ctx.fill();
    }

    renderSelectedBorder(
        ctx: CanvasRenderingContext2D,
        x0: number,
        x1: number,
        y: number,
        h: number,
        displayMode: EventDisplayMode,
    ) {
        const borderThickness = SELECTION_OUTLINE_THICKNESS;
        const borderColor = getCssColor('--g-color-line-brand');
        const backgroundColor = getCssColor('--g-color-base-background');

        const borderX0 = x0 + borderThickness / 2;
        const borderWidth = x1 - x0 - borderThickness;
        const borderY0 = y - borderThickness;
        const borderHeight = h + borderThickness * 2;

        ctx.beginPath();
        ctx.rect(borderX0, borderY0, borderWidth, borderHeight);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderThickness;
        ctx.stroke();

        const innerBorderOffset = 1;
        const innerBorderX0 = borderX0 + innerBorderOffset;
        const innerBorderY0 = y - innerBorderOffset;
        const innerBorderWidth = borderWidth - 2 * innerBorderOffset;
        const innerBorderHeight = h + 2 * innerBorderOffset;

        ctx.beginPath();
        ctx.rect(innerBorderX0, innerBorderY0, innerBorderWidth, innerBorderHeight);
        ctx.strokeStyle =
            displayMode === EventDisplayMode.SelectedFound ? 'rgba(255, 219, 77)' : backgroundColor;
        ctx.lineWidth = innerBorderOffset;
        ctx.stroke();
    }

    getHitbox(_event: TimelineEvent, rawX0: number, rawX1: number) {
        const {x0, x1} = this.getFixedXCoordinates(rawX0, rawX1);
        this.hitboxResult.left = x0;
        this.hitboxResult.right = x1;
        return this.hitboxResult;
    }

    getFixedXCoordinates(x0: number, x1: number) {
        return x1 - x0 < MIN_LINE_WIDTH ? {x0, x1: x0 + MIN_LINE_WIDTH} : {x0, x1};
    }
}
