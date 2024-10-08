import {ElkExtendedEdge} from 'elkjs';

import {Path2DRenderStyleResult} from '@gravity-ui/graph/build/components/canvas/connections/BatchPath2D';
import {BlockConnection} from '@gravity-ui/graph/build/components/canvas/connections/BlockConnection';
import {TConnection} from '@gravity-ui/graph/build/store/connection/ConnectionState';
import {curvePolyline} from '@gravity-ui/graph/build/utils/shapes/curvePolyline';
import {trangleArrowForVector} from '@gravity-ui/graph/build/utils/shapes/triangle';

export type TElkTConnection = TConnection & {
    elk: ElkExtendedEdge;
};

export class ELKConnection extends BlockConnection<TElkTConnection> {
    protected points: {x: number; y: number}[] = [];

    createPath() {
        const elk = this.connectedState.$state.value.elk;
        if (!elk.sections || !this.points?.length) {
            return super.createPath();
        }
        return curvePolyline(this.points, 10);
    }

    createArrowPath(): Path2D {
        const [start, end] = this.points.slice(this.points.length - 2);
        return trangleArrowForVector(start, end, 16, 10);
    }

    styleArrow(ctx: CanvasRenderingContext2D): Path2DRenderStyleResult {
        const color = this.state.selected
            ? this.context.colors.connection?.selectedBackground
            : this.context.colors.connection?.background;

        ctx.fillStyle = color || '#ccc';
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = this.state.selected || this.state.hovered ? -1 : 1;
        return {type: 'both'};
    }

    getPoints() {
        return this.points || [];
    }

    afterRender?(_: CanvasRenderingContext2D): void {
        return;
    }

    updatePoints(): void {
        super.updatePoints();
        const elk = this.connectedState.$state.value.elk;
        if (!elk || !elk.sections) {
            return;
        }
        const section = elk.sections[0];

        this.points = [
            section.startPoint,
            ...(section.bendPoints?.map((point) => point) || []),
            section.endPoint,
        ];

        return;
    }

    getBBox() {
        const elk = this.connectedState.$state.value.elk;
        if (!elk || !elk.sections) {
            return super.getBBox();
        }

        const x: number[] = [];
        const y: number[] = [];
        elk.sections.forEach((c) => {
            x.push(c.startPoint.x);
            y.push(c.startPoint.y);
            c.bendPoints?.forEach((point) => {
                x.push(point.x);
                y.push(point.y);
            });
            x.push(c.endPoint.x);
            y.push(c.endPoint.y);
        });
        return [Math.min(...x), Math.min(...y), Math.max(...x), Math.max(...y)] as const;
    }
}
