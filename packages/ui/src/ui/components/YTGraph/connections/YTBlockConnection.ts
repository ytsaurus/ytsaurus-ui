import {BlockConnection, type BlockState, type TConnection, type TPoint} from '@gravity-ui/graph';
import {type YTGraphCanvasBlock} from '../canvas/YTGrapCanvasBlock';
import {generatePortSideBezierParams} from '../canvas/helpers/generateBezierParams';
import {updateConnectionLineWidth} from './utils';

const ARROW_SIZE = 8;

function getAnchorSide(block?: BlockState, anchorId?: string) {
    const anchor = anchorId ? block?.getAnchorById(anchorId)?.asTAnchor() : undefined;
    const view = block?.getViewComponent() as Partial<YTGraphCanvasBlock<never>> | undefined;
    return anchor && view?.getAnchorSide?.(anchor);
}

export class YTBlockConnection extends BlockConnection<TConnection> {
    override style(ctx: CanvasRenderingContext2D) {
        const result = super.style(ctx);
        updateConnectionLineWidth(ctx, this.context.graph.cameraService.getCameraBlockScaleLevel());
        return result;
    }

    override styleArrow(ctx: CanvasRenderingContext2D) {
        const result = super.styleArrow(ctx);
        updateConnectionLineWidth(ctx, this.context.graph.cameraService.getCameraBlockScaleLevel());
        return result;
    }

    override createArrowPath() {
        const bezier = this.getPortSideBezier();
        if (!bezier) {
            return super.createArrowPath();
        }
        // The point and the tangent of the curve at t = 0.5
        const [p0, p1, p2, p3] = bezier;
        const x = (p0.x + 3 * p1.x + 3 * p2.x + p3.x) / 8;
        const y = (p0.y + 3 * p1.y + 3 * p2.y + p3.y) / 8;
        const angle = Math.atan2(p3.y + p2.y - p1.y - p0.y, p3.x + p2.x - p1.x - p0.x);
        const wing = (delta: number) => ({
            x: x + Math.cos(angle + Math.PI + delta) * ARROW_SIZE * Math.SQRT2,
            y: y + Math.sin(angle + Math.PI + delta) * ARROW_SIZE * Math.SQRT2,
        });
        const [top, bottom] = [wing(Math.PI / 4), wing(-Math.PI / 4)];
        const path = new Path2D();
        path.moveTo(top.x, top.y);
        path.lineTo(x, y);
        path.lineTo(bottom.x, bottom.y);
        return path;
    }

    protected override createPath() {
        const bezier = this.getPortSideBezier();
        if (!bezier) {
            return super.createPath();
        }
        const [start, p1, p2, end] = bezier;
        const path = new Path2D();
        path.moveTo(start.x, start.y);
        path.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, end.x, end.y);
        return path;
    }

    protected override collectBBoxPoints(props = this.props): Array<TPoint> {
        return [...super.collectBBoxPoints(props), ...(this.getPortSideBezier() ?? [])];
    }

    // The edge follows the sides of its ports when a block puts an anchor on a side other than the default one
    private getPortSideBezier() {
        if (!this.connectionPoints) {
            return undefined;
        }
        const {$state, $sourceBlock, $targetBlock} = this.connectedState;
        const {sourceAnchorId, targetAnchorId} = $state.value;
        const sourceSide = getAnchorSide($sourceBlock.value, sourceAnchorId);
        const targetSide = getAnchorSide($targetBlock.value, targetAnchorId);
        if (!sourceSide && !targetSide) {
            return undefined;
        }
        const [start, end] = this.connectionPoints;
        return generatePortSideBezierParams(
            start,
            end,
            sourceSide ?? 'right',
            targetSide ?? 'left',
        );
    }
}
