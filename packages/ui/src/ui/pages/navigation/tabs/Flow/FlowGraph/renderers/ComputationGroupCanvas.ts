import {YTGraphFontSize} from '../../../../../../components/YTGraph';
import {ComputationCanvasBlock} from './ComputationCanvas';

export class ComputationGroupCanvasBlock extends ComputationCanvasBlock {
    constructor(...args: ConstructorParameters<typeof ComputationCanvasBlock>) {
        super(...args);

        this.PADDING = 50;
    }

    override getComputationFontSize(): YTGraphFontSize {
        return 64;
    }

    override renderBlock() {
        super.renderBlock('schematic');
    }
}
