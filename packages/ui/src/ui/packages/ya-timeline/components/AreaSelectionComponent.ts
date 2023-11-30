import { YaTimeline } from "../YaTimeline";
import { yaTimelineConfig } from "../config";
import { TimelineComponent } from "./TimelineComponent";
import { TimelineCanvasApi } from "../TimelineCanvasApi";
import { checkControlCommandKey } from "../lib/utils";
import { Events } from "./Events";

export class AreaSelectionComponent extends TimelineComponent {
  public borderColor: string = yaTimelineConfig.SELECTION_OUTLINE_COLOR;

  public innerColor: string = yaTimelineConfig.SELECTION_BG_COLOR;

  constructor(
    host: YaTimeline,
    options: {
      borderColor?: string;
      innerColor?: string;
      onSelected?: (rect: DOMRect) => void;
    } = {}
  ) {
    super(host);

    Object.assign(this, options);

    this.canvasApi.canvas.addEventListener("mousedown", this.handleCanvasMousedown);
  }

  public render(api: TimelineCanvasApi): void {
    if (!this.area) return;

    const area = this.area;
    const ctx = api.ctx;

    api.useStaticTransform();

    ctx.strokeStyle = yaTimelineConfig.resolveCssValue(this.borderColor);
    ctx.fillStyle = yaTimelineConfig.resolveCssValue(this.innerColor);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.strokeRect(area.x, area.y, area.width, area.height);
    const oldAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 0.1;
    ctx.fillRect(area.x, area.y, area.width, area.height);
    ctx.globalAlpha = oldAlpha;
  }

  protected handleCanvasMousedown = (event: MouseEvent) => {
    if (!checkControlCommandKey(event)) {
      return;
    }

    event.stopPropagation();
    event.stopImmediatePropagation();

    const canvasRect = this.canvasApi.canvas.getBoundingClientRect();
    const x0 = event.clientX - canvasRect.left;
    const y0 = event.clientY - canvasRect.top;

    const onMove = (moveEvent: MouseEvent) => {
      const x1 = moveEvent.clientX - canvasRect.left;
      const y1 = moveEvent.clientY - canvasRect.top;

      const travel = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);

      if (travel > 3) {
        this.area = new DOMRect(x0, y0, x1 - x0, y1 - y0);
        this.host.scheduleTimelineRender();
      }
    };

    const onEnd = () => {
      if (this.area) {
        this.onSelected(this.area);
        this.area = undefined;
        this.host.scheduleTimelineRender();
      }

      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
  };

  protected area: DOMRect | undefined;

  protected onSelected = (rect: DOMRect) => {
    const eventsComponent = this.canvasApi.getComponent(Events);

    if (eventsComponent) {
      eventsComponent.selectEventsAt(rect);
    }
  };
}
