import {generateBezierParams} from './generateBezierParams';

export const bezierCurveLine = (
    startPos: {x: number; y: number},
    endPos: {x: number; y: number},
) => {
    const path = new Path2D();
    const [start, firstPoint, secondPoint, end] = generateBezierParams(startPos, endPos);
    path.moveTo(start.x, start.y);
    path.bezierCurveTo(firstPoint.x, firstPoint.y, secondPoint.x, secondPoint.y, end.x, end.y);

    return path;
};
