import {MultipointConnection} from '@gravity-ui/graph/react';
import {TPoint} from '@gravity-ui/graph';
import {bezierCurveLine} from './helpers/bezierCurveLine';
import {generateBezierParams} from './helpers/generateBezierParams';
import {createArrowPath} from './helpers/createArrowPath';

export class BezierMultipointConnection extends MultipointConnection {
    override createPath(): Path2D {
        const points = this.getPoints();
        if (points.length < 2) {
            return super.createPath();
        }

        if (points.length === 2) {
            return bezierCurveLine(points[0], points[1]);
        }

        const path = new Path2D();

        for (let i = 1; i < points.length; i++) {
            const startPoint = points[i - 1];
            const endPoint = points[i];

            if (startPoint.y === endPoint.y) {
                path.moveTo(startPoint.x, startPoint.y);
                path.lineTo(endPoint.x, endPoint.y);
            } else {
                const [start, firstPoint, secondPoint, end] = generateBezierParams(
                    startPoint,
                    endPoint,
                );
                path.moveTo(start.x, start.y);
                path.bezierCurveTo(
                    firstPoint.x,
                    firstPoint.y,
                    secondPoint.x,
                    secondPoint.y,
                    end.x,
                    end.y,
                );
            }
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
