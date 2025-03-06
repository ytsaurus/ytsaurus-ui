import {AbstractEventRenderer, Hitbox} from './AbstractEventRenderer';
import {TimelineEvent} from './common';
import {yaTimelineConfig} from '../../config';
import {JobPhase} from "../../../../store/reducers/operations/jobs/jobs-timeline-slice";
import {
    TIMELINE_HEIGHT,
    TIMELINE_SELECT_BORDER_WIDTH
} from "../../../../pages/operations/OperationDetail/tabs/JobsTimeline/constants";

export type JobEvent = {
    percentage: number;
    color: string;
    state: string;
    interval: {
        from: number;
        to: number;
    }
    phases: JobPhase[]
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
        if (isSelected) {
            ctx.beginPath();
            ctx.rect(
                x0 - TIMELINE_SELECT_BORDER_WIDTH,
                y - TIMELINE_SELECT_BORDER_WIDTH,
                x1 + TIMELINE_SELECT_BORDER_WIDTH * 2,
                TIMELINE_HEIGHT + TIMELINE_SELECT_BORDER_WIDTH * 2,
            );
            ctx.strokeStyle = yaTimelineConfig.resolveCssValue(
                yaTimelineConfig.SELECTION_OUTLINE_COLOR,
            );
            ctx.lineWidth = TIMELINE_SELECT_BORDER_WIDTH;
            ctx.stroke();
        }

        const percent = (x1 - x0) / 100;
        const partsCount = event.parts.length;
        let startX = x0;
        event.parts.forEach(({color, percentage}, i) => {
            const needSeparator = partsCount -1 !== i;
            const width = percentage * percent;

            ctx.beginPath();
            ctx.fillStyle = color || '#333';
            ctx.rect(startX, y, needSeparator ? width - 1 : width, TIMELINE_HEIGHT);
            ctx.fill();
            startX += width;
        });
    }

    getHitbox(_event: TimelineEvent, x0: number, x1: number): Hitbox {
        this.hitboxResult.left = x0;
        this.hitboxResult.right = x1;
        return this.hitboxResult;
    }
}
