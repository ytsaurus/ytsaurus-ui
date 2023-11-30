import { EventStatus, renderGroupCounter, TimelineEvent } from "./common";
import { AbstractEventRenderer, Hitbox } from "./AbstractEventRenderer";
import { yaTimelineConfig } from "../../config";

export type EventGroup = TimelineEvent & {
  eventsCount: number;
  status: EventStatus;
};

const SINGLE_EVENT_RADIUS = 5;
const GROUP_RADIUS = 6;

export class EventGroupRenderer extends AbstractEventRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    event: EventGroup,
    isSelected: boolean,
    x0: number,
    x1: number,
    y: number
  ) {
    if (event.eventsCount === 1) {
      ctx.beginPath();
      ctx.fillStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.eventStatusColors[event.status]);
      ctx.arc(x0, y, SINGLE_EVENT_RADIUS, 0, 2 * Math.PI);

      if (isSelected) {
        ctx.strokeStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.SELECTION_OUTLINE_COLOR);
        ctx.lineWidth = yaTimelineConfig.SELECTION_OUTLINE_THICKNESS;
        ctx.stroke();
      }

      ctx.fill();
    } else if (event.eventsCount > 1) {
      ctx.fillStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.groupStatusColors[event.status]);
      ctx.beginPath();
      ctx.arc(x0, y, GROUP_RADIUS, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.arc(x1, y, GROUP_RADIUS, (3 * Math.PI) / 2, Math.PI / 2);
      ctx.closePath();

      if (isSelected) {
        ctx.strokeStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.SELECTION_OUTLINE_COLOR);
        ctx.lineWidth = yaTimelineConfig.SELECTION_OUTLINE_THICKNESS;
        ctx.stroke();
      }

      ctx.fill();

      const textX = Math.max(x0, yaTimelineConfig.COUNTER_PADDING);
      renderGroupCounter(ctx, event, textX, y, x1 - textX);
    }
  }

  public getHitbox(_event: TimelineEvent, x0: number, x1: number): Hitbox {
    this.hitboxResult.left = x0 - GROUP_RADIUS;
    this.hitboxResult.right = x1 + GROUP_RADIUS;
    return this.hitboxResult;
  }
}
