import {Graph} from '@gravity-ui/graph';
import {getScaleRelativeDimensions} from './getScale';

export const zoomGraphToCenter = (
    graph: Graph,
    options?: {
        blockSide: number;
        padding: number;
    },
) => {
    const blocks = graph.rootStore.blocksList.$blocks.value;
    const padding = options?.padding || 0;
    const blockSide = options?.blockSide || 0;
    const x: number[] = [];
    const y: number[] = [];

    blocks.forEach((block) => {
        x.push(block.x);
        y.push(block.y);
    });

    const minX = Math.min(...x);
    const minY = Math.min(...y);

    const width = Math.max(...x) + blockSide - minX;
    const height = Math.max(...y) + blockSide - minY;

    const endScale = getScaleRelativeDimensions(
        graph.cameraService.getCameraState(),
        width + padding * 2,
        height + padding * 2,
    );

    const xyPosition = graph.cameraService.getXYRelativeCenterDimensions(
        {
            x: minX - padding,
            y: minY - padding,
            width: width + padding * 2,
            height: height + padding * 2,
        },
        endScale,
    );

    graph.cameraService.set({...xyPosition, scale: endScale});
};
