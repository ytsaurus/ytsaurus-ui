import {MultipointConnection} from '@gravity-ui/graph/react';
import {TPoint} from '@gravity-ui/graph';
import {generateBezierParams} from './helpers/generateBezierParams';
import {createArrowPath} from './helpers/createArrowPath';
import {addBezierSegmentToPath} from './helpers/addBezierSegmentToPath';

export class BezierMultipointConnection extends MultipointConnection {
    override createPath(): Path2D {
        const points = this.getPoints();
        if (points.length < 2) {
            return super.createPath();
        }

        const path = new Path2D();

        for (let i = 1; i < points.length; i++) {
            addBezierSegmentToPath(path, points[i - 1], points[i]);
        }

        return path;
    }

    override createArrowPath(): Path2D {
        const lastTwoPoints = this.getLastTwoPoints();
        if (!lastTwoPoints) {
            return new Path2D();
        }

        const [startPoint, endPoint] = lastTwoPoints;

        if (startPoint.y === endPoint.y) {
            return createArrowPath(startPoint, endPoint, 16, 10);
        }

        // For bezier curves
        const [, , secondControlPoint, end] = generateBezierParams(startPoint, endPoint);
        return createArrowPath(secondControlPoint, end, 16, 10);
    }

    private getLastTwoPoints(): [TPoint, TPoint] | null {
        const points = this.getPoints();
        if (points.length < 2) {
            return null;
        }
        return [points[points.length - 2], points[points.length - 1]];
    }
}
