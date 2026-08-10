import {MultipointConnection} from '@gravity-ui/graph/react';
import {updateConnectionLineWidth} from './utils';

export class YTMultipointConnection extends MultipointConnection {
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
