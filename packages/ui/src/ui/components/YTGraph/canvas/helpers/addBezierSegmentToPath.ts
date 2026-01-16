import {TPoint} from '@gravity-ui/graph';
import {generateBezierParams} from './generateBezierParams';

export const addBezierSegmentToPath = (path: Path2D, startPoint: TPoint, endPoint: TPoint) => {
    if (startPoint.y === endPoint.y) {
        path.moveTo(startPoint.x, startPoint.y);
        path.lineTo(endPoint.x, endPoint.y);
    } else {
        const [start, firstPoint, secondPoint, end] = generateBezierParams(startPoint, endPoint);
        path.moveTo(start.x, start.y);
        path.bezierCurveTo(firstPoint.x, firstPoint.y, secondPoint.x, secondPoint.y, end.x, end.y);
    }
};
