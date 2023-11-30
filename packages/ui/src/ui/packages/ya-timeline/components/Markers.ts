import {clamp, pointToRangeIntersect} from "../../math";
import {TimelineCanvasApi} from "../TimelineCanvasApi";
import {YaTimeline} from "../YaTimeline";
import {yaTimelineConfig} from "../config";
import {TimelineComponent} from "./TimelineComponent";

export type TimelineMarker = {
  time: number;
  color: string;
  width?: number;
  label?: string;
  labelColor?: string;
  labelBottom?: string;
  labelBottomBackgroundColor?: string;
  labelBottomColor?: string;
};

export class Markers extends TimelineComponent {
  public set markers(markers: TimelineMarker[]) {
    this.sortedMarkers = markers.slice().sort((a, b) => a.time - b.time);
  }

  public get markers(): TimelineMarker[] {
    return this.sortedMarkers;
  }

  public constructor(host: YaTimeline, markers?: TimelineMarker[]) {
    super(host);

    if (markers) {
      this.markers = markers;
    }
  }

  public render(api: TimelineCanvasApi) {
    api.useStaticTransform();

    this.lastRenderedLabelPosition = { top: Infinity, bottom: Infinity };

    for (let i = this.sortedMarkers.length - 1; i >= 0; i -= 1) {
      const marker = this.sortedMarkers[i];
      let overscan = 0;

      if (marker.label) {
        overscan = api.widthToTime(api.ctx.measureText(marker.label).width + this.labelPadding);
      }

      if (pointToRangeIntersect(marker.time, api.start - overscan, api.end + overscan)) {
        this.renderMarker(api, marker);
      }
    }
  }

  protected labelPadding = 3;

  protected labelHeight = 14;

  protected sortedMarkers: TimelineMarker[] = [];

  protected lastRenderedLabelPosition = { top: Infinity, bottom: Infinity };

  protected renderMarker(api: TimelineCanvasApi, marker: TimelineMarker) {
    const ctx = api.ctx;
    const markerPosition = api.timeToPosition(marker.time);
    ctx.strokeStyle = marker.color;
    ctx.lineWidth = marker.width ?? 1;
    ctx.beginPath();
    ctx.moveTo(markerPosition, marker.label ? this.labelHeight : 0);
    ctx.lineTo(markerPosition, ctx.canvas.height);
    ctx.stroke();

    if (marker.label) {
      this.renderLabel(
        api,
        markerPosition,
        { label: marker.label, backgroundColor: marker.color, textColor: marker.labelColor },
        "top"
      );
    }
    if (marker.labelBottom) {
      this.renderLabel(
        api,
        markerPosition,
        {
          label: marker.labelBottom,
          backgroundColor: marker.labelBottomBackgroundColor ?? marker.color,
          textColor: marker.labelBottomColor,
        },
        "bottom"
      );
    }
  }

  protected renderLabel(
    api: TimelineCanvasApi,
    markerPosition: number,
    { label, backgroundColor, textColor }: { label: string; backgroundColor: string; textColor?: string },
    position: "top" | "bottom"
  ) {
    const ctx = api.ctx;
    const labelSize = ctx.measureText(label);
    const labelWidth = labelSize.width + this.labelPadding * 2;
    const labelPosition = clamp(
      markerPosition - labelWidth / 2,
      0,
      Math.min(ctx.canvas.width, this.lastRenderedLabelPosition[position]) - labelWidth
    );

    if (markerPosition < this.lastRenderedLabelPosition[position]) {
      ctx.font = yaTimelineConfig.RULER_FONT;
      this.lastRenderedLabelPosition[position] = labelPosition;
      ctx.fillStyle = yaTimelineConfig.resolveCssValue(backgroundColor);
      const y = position === "top" ? 0 : ctx.canvas.clientHeight - this.labelHeight;
      ctx.fillRect(labelPosition, y, labelWidth, this.labelHeight);
      ctx.fillStyle = yaTimelineConfig.resolveCssValue(textColor || yaTimelineConfig.PRIMARY_BACKGROUND_COLOR);
      ctx.fillText(label, labelPosition + this.labelPadding, y + 10);
    }
  }
}
