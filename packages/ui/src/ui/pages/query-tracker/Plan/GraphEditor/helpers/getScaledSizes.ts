import {ScaleStep} from '../enums';

export type GraphSize = {
    block: {height: number; width: number};
    layout: {vertical: number; horizontal: number};
};

const blockSizeMap: Record<ScaleStep, GraphSize> = {
    [ScaleStep.Minimalistic]: {
        block: {height: 35, width: 35},
        layout: {vertical: 35, horizontal: 35},
    },
    [ScaleStep.Schematic]: {
        block: {height: 70, width: 70},
        layout: {vertical: 70, horizontal: 70},
    },
    [ScaleStep.Detailed]: {
        block: {height: 70, width: 240},
        layout: {vertical: 50, horizontal: 50},
    },
};

export const getScaledSizes = (scale: ScaleStep): GraphSize => {
    const {block, layout} = blockSizeMap[scale];
    const scalePercent = 1 / scale;

    return {
        block: {height: block.height * scalePercent, width: block.width * scalePercent},
        layout: {
            vertical: layout.vertical * scalePercent,
            horizontal: layout.horizontal * scalePercent,
        },
    };
};
