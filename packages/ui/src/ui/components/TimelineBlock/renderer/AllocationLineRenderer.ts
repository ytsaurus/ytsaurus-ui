import {TimelineEvent, yaTimelineConfig} from '../../../packages/ya-timeline';
import {AbstractEventRenderer} from '../../../packages/ya-timeline/components/Events';
import {Hitbox} from '../../../packages/ya-timeline/components/Events/AbstractEventRenderer';

export type AllocationLineEvent = TimelineEvent & {
    allocationId: string;
};

const MIN_LINE_WIDTH = 8;

export class AllocationLineRenderer extends AbstractEventRenderer {
    render(
        ctx: CanvasRenderingContext2D,
        _: AllocationLineEvent,
        __: boolean,
        rawX0: number,
        rawX1: number,
        y: number,
    ) {
        const y0 = y - yaTimelineConfig.LINE_HEIGHT / 2;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(107, 132, 153, 0.3)';
        ctx.rect(rawX0, y0, rawX1 - rawX0, yaTimelineConfig.LINE_HEIGHT);
        ctx.fill();
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
