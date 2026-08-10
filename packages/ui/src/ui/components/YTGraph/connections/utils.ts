import {ECameraScaleLevel} from '@gravity-ui/graph';

export function updateConnectionLineWidth(ctx: CanvasRenderingContext2D, level: ECameraScaleLevel) {
    switch (level) {
        case ECameraScaleLevel.Minimalistic:
            ctx.lineWidth *= 3;
            break;
        default:
            ctx.lineWidth *= 2;
    }
}
