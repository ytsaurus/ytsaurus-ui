import {
    AbstractEventRenderer,
    Hitbox,
} from '../../../../../../../packages/ya-timeline/components/Events/AbstractEventRenderer';
import {TimelineEvent, yaTimelineConfig} from '../../../../../../../packages/ya-timeline';
import {JobPhase} from '../../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {MIN_LINE_WIDTH} from '../../constants';

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
};

export class JobLineRenderer extends AbstractEventRenderer {
    render(
        ctx: CanvasRenderingContext2D,
        event: JobLineEvent,
        isSelected: boolean,
        rawX0: number,
        rawX1: number,
        y: number,
    ) {
        const y0 = y - yaTimelineConfig.LINE_HEIGHT / 2;
        const {x1, x0} = this.getFixedXCoordinates(rawX0, rawX1);

        const percent = (x1 - x0) / 100;

        let startX = x0;
        event.parts.forEach(({color, percentage}) => {
            const width = percentage * percent;

            ctx.beginPath();
            ctx.fillStyle = color || '#333';
            ctx.rect(startX, y0, width, yaTimelineConfig.LINE_HEIGHT);
            ctx.fill();
            startX += width;
        });

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + 8, y0 + yaTimelineConfig.LINE_HEIGHT / 2);
        ctx.lineTo(x0, y0 + yaTimelineConfig.LINE_HEIGHT);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x1, y0);
        ctx.lineTo(x1 - 8, y0 + yaTimelineConfig.LINE_HEIGHT / 2);
        ctx.lineTo(x1, y0 + yaTimelineConfig.LINE_HEIGHT);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        const borderThickness = yaTimelineConfig.SELECTION_OUTLINE_THICKNESS;
        if (isSelected) {
            const borderColor = yaTimelineConfig.resolveCssValue(
                yaTimelineConfig.SELECTION_OUTLINE_COLOR,
            );
            const backgroundColor = yaTimelineConfig.resolveCssValue(
                yaTimelineConfig.PRIMARY_BACKGROUND_COLOR,
            );

            const borderX0 = x0 + borderThickness / 2;
            const borderWidth = x1 - x0 - borderThickness;
            const borderY0 = y0 - borderThickness;
            const borderHeight = yaTimelineConfig.LINE_HEIGHT + borderThickness * 2;

            ctx.beginPath();
            ctx.rect(borderX0, borderY0, borderWidth, borderHeight);
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderThickness;
            ctx.stroke();

            const innerBorderOffset = 1;
            const innerBorderX0 = borderX0 + innerBorderOffset;
            const innerBorderY0 = y0 - innerBorderOffset;
            const innerBorderWidth = borderWidth - 2 * innerBorderOffset;
            const innerBorderHeight = yaTimelineConfig.LINE_HEIGHT + 2 * innerBorderOffset;

            ctx.beginPath();
            ctx.rect(innerBorderX0, innerBorderY0, innerBorderWidth, innerBorderHeight);
            ctx.strokeStyle = backgroundColor;
            ctx.lineWidth = innerBorderOffset;
            ctx.stroke();
        }
    }

    getHitbox(_event: TimelineEvent, rawX0: number, rawX1: number): Hitbox {
        const {x0, x1} = this.getFixedXCoordinates(rawX0, rawX1);
        this.hitboxResult.left = x0;
        this.hitboxResult.right = x1;
        return this.hitboxResult;
    }

    getFixedXCoordinates(x0: number, x1: number) {
        return x1 - x0 < MIN_LINE_WIDTH ? {x0, x1: x0 + MIN_LINE_WIDTH} : {x0, x1};
    }
}
