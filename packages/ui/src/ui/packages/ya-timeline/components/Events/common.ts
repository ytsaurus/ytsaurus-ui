import { yaTimelineConfig } from "../../config";
import { EventGroup } from "./EventGroupRenderer";
import { UnixTimestampMs } from "../../definitions";

export function renderGroupCounter(
  ctx: CanvasRenderingContext2D,
  group: EventGroup,
  x: number,
  y: number,
  maxWidth: number
): void {
  const label = `${group.eventsCount}`;
  const textMetrics = ctx.measureText(label);

  if (textMetrics.width < maxWidth) {
    ctx.fillStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.COUNTER_FONT_COLOR);
    ctx.fillText(label, x, y + yaTimelineConfig.COUNTER_FONT_CENTER_OFFSET);
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/roundRect not supported by Firefox and Safari
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export enum EventStatus {
  INFO = "INFO",
  QUEUED = "QUEUED",
  DEPRECATED = "DEPRECATED",
  OK = "OK",
  WARNING = "WARNING",
  DANGER = "DANGER",
  MUTED = "MUTED",
  DELETED = "DELETED",
}

export type TimelineEvent = {
  from: UnixTimestampMs;
  to?: UnixTimestampMs; // event may not have a duration
  renderType: string;
  axisId: string;
  trackIndex: number;
  eventsCount: number;
};
export type RawTimelineEvent = any;
