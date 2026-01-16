import {ECameraScaleLevel} from '@gravity-ui/graph';

import {BezierMultipointConnection} from '../../../../components/YTGraph';

const DEFAULT_LINE_WIDTH = 2;
const MINIMALISTIC_LINE_WIDTH = 8;
const ACTIVE_LINE_WIDTH = 3;

export class QueriesNodeConnection extends BezierMultipointConnection {
    override style(ctx: CanvasRenderingContext2D) {
        const scaleLevel = this.context.graph.cameraService.getCameraBlockScaleLevel();
        const isMinimalistic = scaleLevel === ECameraScaleLevel.Minimalistic;

        const connectionColors = this.context.colors.connection;
        const strokeStyle = this.state.selected
            ? connectionColors?.selectedBackground
            : connectionColors?.background;

        ctx.strokeStyle = strokeStyle ?? '#000';

        let lineWidth = DEFAULT_LINE_WIDTH;
        if (isMinimalistic) {
            lineWidth = MINIMALISTIC_LINE_WIDTH;
        } else if (this.state.hovered || this.state.selected) {
            lineWidth = ACTIVE_LINE_WIDTH;
        }
        ctx.lineWidth = lineWidth;

        return {type: 'stroke'} as const;
    }
}
