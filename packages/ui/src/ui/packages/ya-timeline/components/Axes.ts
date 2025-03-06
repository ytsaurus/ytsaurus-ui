import {clamp} from "../../math";
import {TimelineCanvasApi} from "../TimelineCanvasApi";
import {YaTimeline} from "../YaTimeline";
import {yaTimelineConfig} from "../config";
import {AxesIndex} from "../lib/AxesIndex";
import {Ruler} from "./Ruler";
import {TimelineComponent} from "./TimelineComponent";

export type TimelineAxis = {
  id: string;
  tracksCount: number;
  top: number;
  height: number;
};

export type AxesOptions = {
    axisColor?: string;
    strokeMode?: EStrokeMode;
    trackHeight?: number;
    eventOffset?: number;
    topPadding?: number;
    identityFunction?: <Axis>(axis: Axis) => string;
}

export enum EStrokeMode {
  STRAIGHT,
  DASHED,
}

export class Axes<Axis extends TimelineAxis = TimelineAxis> extends TimelineComponent {
  public trackHeight: number = yaTimelineConfig.TRACK_HEIGHT;
  public lineHeight: number = yaTimelineConfig.LINE_HEIGHT;

  public strokeMode = EStrokeMode.STRAIGHT;

  protected axesIndex!: AxesIndex<Axis>;

  public set axes(newAxes: Axis[]) {
    this.axesIndex.axes = newAxes;
  }

  public get axes(): Axis[] {
    return this.axesIndex.axes;
  }

  public get axesById(): Record<string, Axis> {
    return this.axesIndex.axesById;
  }

  public getAxisTrackPosition(axis: Axis, trackIndex: number): number {
    const index = clamp(trackIndex, 0, axis.tracksCount - 1);
    return axis.top + this.trackHeight * index + this.trackHeight / 2;
  }

  public constructor(
    host: YaTimeline,
    options: AxesOptions = {}
  ) {
    super(host);

    Object.assign(this, options);

    this.axesIndex = new AxesIndex<Axis>([], { identityFunction: options.identityFunction });
  }

  public render(api: TimelineCanvasApi) {
    const rulerHeight = api.getComponent(Ruler)?.height || 0;
    const ctx = api.ctx;
    if (this.strokeMode === EStrokeMode.DASHED) {
      ctx.setLineDash([5, 3]);
    }

    api.useScrollTransform();
    ctx.translate(0, rulerHeight);

    const canvasWidth = api.canvas.width;
    ctx.strokeStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.SECONDARY_MARK_COLOR);
    ctx.beginPath();
    ctx.lineWidth = 1;

    for (const axis of this.axesIndex.sortedAxes) {
      for (let i = 0; i < axis.tracksCount; i += 1) {
        const y = this.getAxisTrackPosition(axis, i);
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
      }
    }

    ctx.stroke();
    ctx.setLineDash([0, 0]);
  }
}
