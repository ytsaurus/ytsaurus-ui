import {AbstractEventRenderer, TimelineEvent} from '@gravity-ui/timeline';

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
        h: number,
    ) {
        const height = h * 2;
        const y0 = y - height / 2;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(107, 132, 153, 0.3)';
        ctx.rect(rawX0, y0, rawX1 - rawX0, height);
        ctx.fill();
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
