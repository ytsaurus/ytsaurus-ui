import {
    AbstractEventRenderer,
    Hitbox,
} from '../../../../../../../packages/ya-timeline/components/Events/AbstractEventRenderer';
import {TimelineEvent, yaTimelineConfig} from '../../../../../../../packages/ya-timeline';
import {JobPhase} from '../../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';

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
    parts: JobEvent[];
};

export class JobLineRenderer extends AbstractEventRenderer {
    render(
        ctx: CanvasRenderingContext2D,
        event: JobLineEvent,
        isSelected: boolean,
        x0: number,
        x1: number,
        y: number,
    ) {
        const percent = (x1 - x0) / 100;
        const partsCount = event.parts.length;
        let startX = x0;
        event.parts.forEach(({color, percentage}, i) => {
            const needSeparator = partsCount - 1 !== i;
            const width = percentage * percent;

            ctx.beginPath();
            ctx.fillStyle = color || '#333';
            ctx.rect(startX, y, needSeparator ? width - 1 : width, yaTimelineConfig.TRACK_HEIGHT);
            ctx.fill();
            startX += width;
        });

        if (isSelected) {
            const borderThickness = yaTimelineConfig.SELECTION_OUTLINE_THICKNESS;
            const borderColor = yaTimelineConfig.resolveCssValue(
                yaTimelineConfig.SELECTION_OUTLINE_COLOR,
            );
            const backgroundColor = yaTimelineConfig.resolveCssValue(
                yaTimelineConfig.PRIMARY_BACKGROUND_COLOR,
            );

            const borderX0 = x0 + borderThickness / 2;
            const borderWidth = x1 - x0 - borderThickness;
            const borderY0 = y - borderThickness;
            const borderHeight = yaTimelineConfig.TRACK_HEIGHT + borderThickness * 2;

            ctx.beginPath();
            ctx.rect(borderX0, borderY0, borderWidth, borderHeight);
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderThickness;
            ctx.stroke();

            const innerBorderOffset = 1;
            const innerBorderX0 = borderX0 + innerBorderOffset;
            const innerBorderY0 = y - innerBorderOffset;
            const innerBorderWidth = borderWidth - 2 * innerBorderOffset;
            const innerBorderHeight = yaTimelineConfig.TRACK_HEIGHT + 2 * innerBorderOffset;

            ctx.beginPath();
            ctx.rect(innerBorderX0, innerBorderY0, innerBorderWidth, innerBorderHeight);
            ctx.strokeStyle = backgroundColor;
            ctx.lineWidth = innerBorderOffset;
            ctx.stroke();
        }
    }

    getHitbox(_event: TimelineEvent, x0: number, x1: number): Hitbox {
        this.hitboxResult.left = x0;
        this.hitboxResult.right = x1;
        return this.hitboxResult;
    }
}
