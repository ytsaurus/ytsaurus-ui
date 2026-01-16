const MIN_BEZIER_OFFSET = 25;

export const generateBezierParams = (
    startPos: {x: number; y: number},
    endPos: {x: number; y: number},
) => {
    const distance = Math.abs(endPos.x - startPos.x);
    const coef = Math.max(distance / 2, MIN_BEZIER_OFFSET);
    return [
        startPos,
        {
            x: startPos.x + coef,
            y: startPos.y,
        },
        {
            x: endPos.x - coef,
            y: endPos.y,
        },
        endPos,
    ];
};
