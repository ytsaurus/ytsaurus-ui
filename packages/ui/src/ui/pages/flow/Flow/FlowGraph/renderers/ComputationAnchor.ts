import {Anchor, ECameraScaleLevel} from '@gravity-ui/graph';
import {GRAPH_COLORS} from '../../../../../components/YTGraph/constants';
import {FlowComputationRuntimeType} from '../../types';
import {
    COMPUTATION_ANCHOR_SIZE,
    getStreamsSummmaryByAnchorType,
    hasVisibleStreamsSummaryDetails,
} from '../utils/utils';

export class ComputationAnchor extends Anchor {
    getStreamsSummmaryDetails() {
        const meta = this.connectedState.block.$state.value.meta as FlowComputationRuntimeType;

        const {type} = this.connectedState.state;

        return getStreamsSummmaryByAnchorType(meta, type);
    }

    render() {
        if (this.context.camera.getCameraBlockScaleLevel() === ECameraScaleLevel.Detailed) {
            return;
        }

        const summary = this.getStreamsSummmaryDetails();
        if (!hasVisibleStreamsSummaryDetails(summary)) {
            return;
        }

        const {drained, backpressureDetected} = summary;
        const {ctx} = this.context;

        if (drained) {
            ctx.fillStyle = GRAPH_COLORS.infoLine;
        } else if (backpressureDetected) {
            ctx.fillStyle = GRAPH_COLORS.warningLine;
        } else {
            return;
        }

        const {x, y} = this.getPosition();
        ctx.beginPath();
        ctx.arc(x, y, COMPUTATION_ANCHOR_SIZE / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
}
