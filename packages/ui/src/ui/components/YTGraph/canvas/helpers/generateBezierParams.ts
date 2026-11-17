const MIN_BEZIER_OFFSET = 25;

export type PortSide = 'left' | 'right' | 'top' | 'bottom';

const OUTWARD: Record<PortSide, {x: number; y: number}> = {
    left: {x: -1, y: 0},
    right: {x: 1, y: 0},
    top: {x: 0, y: -1},
    bottom: {x: 0, y: 1},
};

/**
 * The curve leaves `startPos` and enters `endPos` perpendicularly to the sides of their ports.
 */
export const generatePortSideBezierParams = (
    startPos: {x: number; y: number},
    endPos: {x: number; y: number},
    sourceSide: PortSide,
    targetSide: PortSide,
) => {
    const control = (pos: {x: number; y: number}, side: PortSide) => {
        const {x, y} = OUTWARD[side];
        const distance = x ? Math.abs(endPos.x - startPos.x) : Math.abs(endPos.y - startPos.y);
        const coef = Math.max(distance / 2, MIN_BEZIER_OFFSET);
        return {x: pos.x + x * coef, y: pos.y + y * coef};
    };
    return [startPos, control(startPos, sourceSide), control(endPos, targetSide), endPos];
};

export const generateBezierParams = (
    startPos: {x: number; y: number},
    endPos: {x: number; y: number},
) => generatePortSideBezierParams(startPos, endPos, 'right', 'left');
