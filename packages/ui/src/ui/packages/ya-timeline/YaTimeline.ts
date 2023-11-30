import { html, LitElement, PropertyDeclarations, PropertyValues, TemplateResult } from "lit";
import { clamp } from "../math";
import { TimelineComponent } from "./components/TimelineComponent";
import { yaTimelineConfig } from "./config";
import { Constructor, MONTH, UnixTimestampMs } from "./definitions";
import { TimelineCanvasApi } from "./TimelineCanvasApi";

export type BoundsChangedEvent = CustomEvent<{
  start: number;
  end: number;
}>;

export type ScrollTopChangedEvent = CustomEvent<{
  scrollTop: number;
}>;

export abstract class YaTimeline extends LitElement {
  public start: UnixTimestampMs;

  public end: UnixTimestampMs;

  public canvasScrollTop: number;

  private canvasLastWidth: number;

  private canvasLastHeight: number;

  public isZoomAllowed: boolean;

  constructor() {
    super();
    this.canvasLastWidth = 0;
    this.canvasLastHeight = 0;
    this.start = 0;
    this.end = MONTH;
    this.canvasScrollTop = 0;
    this.isZoomAllowed = true;
  }

  public static get properties(): PropertyDeclarations {
    return {
      start: { type: Number },
      end: { type: Number },
      canvasScrollTop: { type: Number },
      isZoomAllowed: { type: Boolean },
    };
  }

  public render(): TemplateResult {
    return html`
      <style>
        :host {
          display: block;
          position: relative;
          width: 100%;
          height: 100%;
        }

        canvas {
          position: relative;
          height: 100%;
          width: 100%;
        }
      </style>

      <canvas tabindex="0">${this.start} ${this.end} ${this.canvasScrollTop}</canvas>
    `;
  }

  protected shouldUpdate(changes: PropertyValues<this>) {
    if (changes.has("start") || changes.has("end") || changes.has("canvasScrollTop")) {
      this.scheduleTimelineRender();
    }

    return super.shouldUpdate(changes);
  }

  public connectedCallback() {
    super.connectedCallback();
    this.init();
  }

  public disconnectedCallback() {
    this.destroy();
    super.disconnectedCallback();
  }

  protected abstract createComponents(): TimelineComponent[];

  public getComponentUnsafe<T extends TimelineComponent>(componentConstructor: Constructor<T>): T | undefined {
    return this.components.find((component) => {
      return component instanceof componentConstructor;
    }) as T | undefined;
  }

  public async getComponent<T extends TimelineComponent>(componentConstructor: Constructor<T>): Promise<T> {
    await this.updateComplete;

    // This will still fail at runtime if timeline is configured improperly
    return this.getComponentUnsafe(componentConstructor)!;
  }

  public getCanvasApiUnsafe(): TimelineCanvasApi | undefined {
    return this.canvasApi;
  }

  protected initComponents(): void {
    this.components = this.createComponents();

    for (const component of this.components) {
      this.addController(component);
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.canvasApi = new TimelineCanvasApi({
      timeline: this,
      notifyBoundsChanged: this.notifyBoundsChanged,
      notifyScrollTopChanged: this.notifyScrollTopChanged,
    });
    this.initComponents();

    const canvas = this.canvasApi.canvas;
    canvas.addEventListener("mousedown", this.handleCanvasMousedown);
    canvas.addEventListener("wheel", this.handleCanvasWheel);
  }

  protected init() {
    this.canvasLastWidth = 0;
    this.canvasLastHeight = 0;

    this.updateComplete.then(() => {
      window.addEventListener("resize", this.handleWindowResize);

      this.sizeUpdateTimerId = window.setInterval(() => {
        const isSizeChanged = this.offsetHeight !== this.canvasLastHeight || this.offsetWidth !== this.canvasLastWidth;

        if (isSizeChanged) {
          this.updateCanvasSize();
          this.canvasLastWidth = this.offsetWidth;
          this.canvasLastHeight = this.offsetHeight;
        }
      }, 2000);

      this.updateCanvasSize();
    });
  }

  protected destroy() {
    window.removeEventListener("resize", this.handleWindowResize);

    clearInterval(this.sizeUpdateTimerId);
  }

  public reset() {
    this.destroy();
    requestAnimationFrame(() => this.init());
  }

  public scheduleTimelineRender() {
    if (!this.isTimelineRenderScheduled) {
      this.isTimelineRenderScheduled = true;

      requestAnimationFrame(() => {
        this.renderTimeline();
        this.isTimelineRenderScheduled = false;
      });
    }
  }

  protected renderTimeline() {
    const api = this.canvasApi!;
    api.useStaticTransform();
    api.clear();

    for (const layer of this.components) {
      layer.render(api);
    }
  }

  public updateCanvasSize(): void {
    const api = this.canvasApi;
    const canvas = api?.canvas;

    if (!canvas) {
      return;
    }

    canvas.width = Math.floor(this.offsetWidth * api.pixelRatio);
    canvas.height = Math.floor(this.offsetHeight * api.pixelRatio);

    this.canvasLastWidth = canvas.width;
    this.canvasLastHeight = canvas.height;

    this.scheduleTimelineRender();
  }

  protected handleWindowResize = () => {
    this.updateCanvasSize();
  };

  protected handleCanvasMousedown = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const sx = event.pageX;
    const sy = event.pageY;

    const start = this.start;
    const initialScrollTop = this.canvasScrollTop;
    const domain = this.end - start;
    const canvasWidth = this.canvasApi!.canvas.width / this.canvasApi!.pixelRatio;
    let travel = 0;

    const onMove = (moveEvent: MouseEvent) => {
      // Handle pan
      const dx = ((moveEvent.pageX - sx) / canvasWidth) * domain;
      this.notifyBoundsChanged(start - dx, start - dx + domain);

      // Handle scroll
      const dy = moveEvent.pageY - sy;

      if (Math.abs(dy) > 0.1) {
        this.notifyScrollTopChanged(clamp(initialScrollTop - dy, 0, Infinity));
      }

      travel = Math.sqrt((moveEvent.pageX - sx) ** 2 + dy ** 2);
    };

    const onEnd = (endEvent: MouseEvent) => {
      if (travel > 2) {
        // User moved the point holding a button.
        // This means that intent was to pan the timeline.
        // So we stop propagation to avoid unexpected side effects.
        endEvent.stopPropagation();
      }

      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd, { capture: true });
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd, { capture: true });
  };

  protected handleCanvasWheel = (event: WheelEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const api = this.canvasApi!;

    if (!event.shiftKey && !this.isZoomAllowed) {
      return;
    }

    let newStart = this.start;
    let newEnd = this.end;
    const oldDomain = newEnd - newStart;
    let isPanned = false;

    if (Math.abs(event.deltaY) > 2) {
      if (event.shiftKey) {
        isPanned = true;
        const shift = oldDomain * event.deltaY * yaTimelineConfig.WHEEL_PAN_SPEED;
        newStart += shift;
        newEnd += shift;
      } else {
        const ratio = event.offsetX / api.canvas.width;
        const factor = event.deltaY > 0 ? 1.15 : 0.9;
        const newDomain = clamp(oldDomain * factor, yaTimelineConfig.ZOOM_MIN, yaTimelineConfig.ZOOM_MAX);
        newStart = Math.round(this.start - (newDomain - oldDomain) * ratio);
        newEnd = Math.round(this.end + (newDomain - oldDomain) * (1 - ratio));
      }
    }

    if (!isPanned && event.deltaX !== 0) {
      const newDomain = newEnd - newStart;
      const shift = newDomain * event.deltaX * yaTimelineConfig.WHEEL_PAN_SPEED;
      newStart += shift;
      newEnd += shift;
    }

    if (newStart !== this.start || newEnd !== this.end) {
      this.notifyBoundsChanged(newStart, newEnd);
    }
  };

  protected canvasApi: TimelineCanvasApi | undefined;

  protected isTimelineRenderScheduled = false;

  protected components: TimelineComponent[] = [];

  private sizeUpdateTimerId: number | undefined;

  protected notifyBoundsChanged = (start: number, end: number): void => {
    this.dispatchEvent(
      new CustomEvent("boundsChanged", {
        detail: { start, end },
      })
    );
  };

  protected notifyScrollTopChanged = (scrollTop: number): void => {
    this.dispatchEvent(
      new CustomEvent("scrollTopChanged", {
        detail: { scrollTop },
      })
    );
  };
}
