import {Anchor, ECameraScaleLevel} from '@gravity-ui/graph';
import {GRAPH_COLORS} from '../../../../../components/YTGraph/constants';
import {type FlowComputationRuntimeType} from '../../types';
import {getStreamsSummaryByAnchorType, hasVisibleStreamsSummaryDetails} from '../utils/utils';

export class ComputationAnchor extends Anchor {
    getStreamsSummmaryDetails() {
        const meta = this.connectedState.block.$state.value.meta as FlowComputationRuntimeType;

        const {type} = this.connectedState.state;

        return getStreamsSummaryByAnchorType(meta, type);
    }

    render() {
        const cameraLevel = this.context.camera.getCameraBlockScaleLevel();
        if (cameraLevel === ECameraScaleLevel.Detailed) {
            return;
        }

        const summary = this.getStreamsSummmaryDetails();
        if (!hasVisibleStreamsSummaryDetails(summary)) {
            return;
        }

        const {drained, backpressureDetected} = summary;
        const {ctx} = this.context;

        ctx.fillStyle = GRAPH_COLORS.genericMediumBackground;

        if (drained) {
            ctx.fillStyle = GRAPH_COLORS.infoLine;
        } else if (backpressureDetected) {
            ctx.fillStyle = GRAPH_COLORS.warningLine;
        }

        const isMinimalistic = cameraLevel === ECameraScaleLevel.Minimalistic;
        const radius = isMinimalistic ? (this.state.size / 4) * 3 : this.state.size / 2;

        const {x, y} = this.getPosition();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
}
