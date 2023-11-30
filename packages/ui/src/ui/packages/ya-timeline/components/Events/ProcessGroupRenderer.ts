import { yaTimelineConfig } from "../../config";
import { EventStatus, renderGroupCounter, TimelineEvent } from "./common";
import { AbstractEventRenderer, Hitbox } from "./AbstractEventRenderer";

export type ProcessGroup = TimelineEvent & {
  eventsCount: number;
  status: EventStatus;
  statusesSet: Set<EventStatus>; // required to track if group consists of (not)only bad/problematic events
};

const SINGLE_EVENT_HEIGHT = 6;
const GROUP_HEIGHT = 12;
const MIN_EVENT_WIDTH = 5;

export class ProcessGroupRenderer extends AbstractEventRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    event: ProcessGroup,
    isSelected: boolean,
    x0: number,
    x1: number,
    y: number
  ) {
    if (event.eventsCount === 1) {
      const y0 = y - SINGLE_EVENT_HEIGHT / 2;
      const width = Math.max(x1 - x0, MIN_EVENT_WIDTH);
      const height = SINGLE_EVENT_HEIGHT;

      if (isSelected) {
        ctx.strokeStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.SELECTION_OUTLINE_COLOR);
        ctx.lineWidth = yaTimelineConfig.SELECTION_OUTLINE_THICKNESS;
        ctx.strokeRect(x0, y0, width, height);
      }

      ctx.fillStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.eventStatusColors[event.status]);
      ctx.fillRect(x0, y0, width, height);
    } else if (event.eventsCount > 1) {
      const y0 = y - GROUP_HEIGHT / 2;
      const width = Math.max(x1 - x0, MIN_EVENT_WIDTH);
      const height = GROUP_HEIGHT;

      if (isSelected) {
        ctx.strokeStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.SELECTION_OUTLINE_COLOR);
        ctx.lineWidth = yaTimelineConfig.SELECTION_OUTLINE_THICKNESS;
        ctx.strokeRect(x0, y0, width, height);
      }

      ctx.fillStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.groupStatusColors[event.status]);
      ctx.fillRect(x0, y0, width, height);

      const textX = Math.max(x0 + yaTimelineConfig.COUNTER_PADDING, yaTimelineConfig.COUNTER_PADDING);
      renderGroupCounter(ctx, event, textX, y, x1 - textX);
    }
  }

  public getHitbox(_event: TimelineEvent, x0: number, x1: number): Hitbox {
    this.hitboxResult.left = x0;
    this.hitboxResult.right = x0 + Math.max(x1 - x0, MIN_EVENT_WIDTH);
    return this.hitboxResult;
  }
}
