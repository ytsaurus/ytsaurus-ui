import {BlockConnection, type TConnection} from '@gravity-ui/graph';
import {updateConnectionLineWidth} from './utils';

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
}
