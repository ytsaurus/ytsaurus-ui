import {rangeToRangeIntersect} from "../../../math";

import RBush, {BBox} from "rbush";
import {TimelineCanvasApi} from "../../TimelineCanvasApi";
import {YaTimeline} from "../../YaTimeline";
import {yaTimelineConfig} from "../../config";
import {checkControlCommandKey} from "../../lib/utils";
import {Axes} from "../Axes";
import {Ruler} from "../Ruler";
import {TimelineComponent} from "../TimelineComponent";
import {AbstractEventRenderer} from "./AbstractEventRenderer";
import {EventGroup, EventGroupRenderer} from "./EventGroupRenderer";
import {ProcessGroup, ProcessGroupRenderer} from "./ProcessGroupRenderer";
import {TimelineEvent} from "./common";

export {AbstractEventRenderer, EventGroupRenderer, ProcessGroupRenderer};
export type {EventGroup, ProcessGroup, TimelineEvent};

// Event identity helps to keep track of selected events
// even when they regroup after zoom changes
export type EventIdentity = unknown;

export type EventsSelectedEvent<T extends TimelineEvent> = CustomEvent<{
  events: T[];
}>;

export type ContextMenuEvent<T extends TimelineEvent> = CustomEvent<{
  event: T;
  relativeX: number;
  relativeY: number;
}>;

export type HoverEvent<T extends TimelineEvent> = CustomEvent<{
    jobId: string;
    events: T[];
    time: number;
    offset: {
        x: number;
        y: number;
    }
}>;

export type LeftEvent<T extends TimelineEvent> = CustomEvent<{
    event: T;
}>

export class Events<Event extends TimelineEvent = TimelineEvent> extends TimelineComponent {
  public eventHitboxPadding: number = yaTimelineConfig.EVENT_HITBOX_PADDING;

  public eventCounterFont: string = yaTimelineConfig.COUNTER_FONT;

  public allowMultipleSelection = true;
  public activeEvent: TimelineEvent | null = null;

  public set events(newEvents: Event[]) {
    this._events = newEvents;
    this.rebuildIndex();
  }

  public get events(): Event[] {
    return this._events;
  }

  public registerRenderer(type: string, renderer: AbstractEventRenderer) {
    this.renderers.set(type, renderer);
  }

  public getRenderer(type: string): AbstractEventRenderer {
    return this.renderers.get(type)!;
  }

  public getEventsAt(rect: DOMRect): Event[] {
    const api = this.canvasApi;
    const rulerHeight = api.getComponent(Ruler)?.height || 0;
    const topOffset = -rulerHeight + api.canvasScrollTop;
    const events = this.index.search({
      minX: api.positionToTime(rect.left - this.eventHitboxPadding),
      maxX: api.positionToTime(rect.right + this.eventHitboxPadding),
      minY: rect.top + topOffset - this.eventHitboxPadding,
      maxY: rect.bottom + topOffset + this.eventHitboxPadding,
    });
    return events.map((box) => box.event);
  }

  public getEventsAtPoint(x: number, y: number) {
    const p = 6;
    return this.getEventsAt(new DOMRect(x - p / 2, y - p / 2, p, p));
  }

  public set selectedEvents(ids: EventIdentity[]) {
      this._selectedEvents = new Set<EventIdentity>(ids);
  }

  public get selectedEvents(): Event[] {
    return this.events.filter((event) => this.isSelectedEvent(event));
  }

  public isSelectedEvent(event: Event | undefined): boolean {
    if (!event) return false;
    const identity = this.getEventIdentity(event);
    return this._selectedEvents.has(identity);
  }

  public selectEvents(events: Event[], options: SelectOptions = {}): void {
    const selection = this._selectedEvents;

    if (!options.append) {
      selection.clear();
    }

    const add = (id: EventIdentity) => selection.add(id);
    const toggle = (id: EventIdentity) => {
      if (selection.has(id)) {
        selection.delete(id);
      } else {
        selection.add(id);
      }
    };

    const select = options.toggle ? toggle : add;

    if (this.allowMultipleSelection) {
      for (const event of events) {
        select(this.getEventIdentity(event));
      }
    } else if (events.length > 0) {
      if (selection.size > 0 && !selection.has(events[0])) {
        selection.clear();
      }

      if (events.length > 0) {
        select(this.getEventIdentity(events[0]));
      }
    }

    this.host.dispatchEvent(
      new CustomEvent("eventsSelected", {
        detail: { events: this.selectedEvents },
      })
    );

    this.host.scheduleTimelineRender();
  }

  public selectEventsAt(rect: DOMRect, options: SelectOptions = {}): void {
    this.selectEvents(this.getEventsAt(rect), options);
  }

  constructor(
    host: YaTimeline,
    options: {
      eventCounterFont?: string;
      eventHitboxPadding?: number;
      allowMultipleSelection?: boolean;
      getEventIdentity?: (event: Event) => EventIdentity;
      renderers?: { [renderType: string]: AbstractEventRenderer };
    } = {}
  ) {
    super(host);

    const { renderers, ...otherOptions } = options;

    Object.assign(this, otherOptions);

    if (renderers) {
      for (const renderType in renderers) {
        this.registerRenderer(renderType, renderers[renderType]);
      }
    }

    this.canvasApi.canvas.addEventListener("mouseup", this.handleCanvasMouseup);
    this.canvasApi.canvas.addEventListener("contextmenu", this.handleCanvasContextmenu);
    this.canvasApi.canvas.addEventListener('mousemove', this.handleCanvasMousemove);
  }

  public override render(api: TimelineCanvasApi) {
    const axesComponent = api.getComponent(Axes);
    const rulerHeight = api.getComponent(Ruler)?.height || 0;

    if (!axesComponent) {
      return;
    }

    const { axesById } = axesComponent;

    api.useScrollTransform();

    const ctx = api.ctx;
    const timeToPosition = (t: number) => api.timeToPosition(t);

    ctx.translate(0, rulerHeight);

    ctx.font = this.eventCounterFont;
    ctx.lineWidth = 2;

    for (let i = 0, len = this.events.length; i < len; i += 1) {
      const event: Event = this.events[i];
      const axis = axesById[event.axisId];

      if (!axis) continue;

      const y = axesComponent.getAxisTrackPosition(axis, event.trackIndex);

      if (axis && rangeToRangeIntersect(api.start, api.end, event.from, event.to!)) {
        const x0 = api.timeToPosition(event.from);
        const x1 = api.timeToPosition(event.to!);
        this.runRenderer(ctx, event, this.isSelectedEvent(event), x0, x1, y, axis.height!, timeToPosition);
      }
    }
  }

  public runRenderer(
    ctx: CanvasRenderingContext2D,
    event: Event,
    isSelected: boolean,
    x0: number,
    x1: number,
    y: number,
    h: number,
    timeToPosition?: (n: number) => number,
    color?: string
  ) {
    this.renderers
      ?.get(event.renderType)
      ?.render(ctx, event, isSelected, x0, x1, y, h, timeToPosition, color);
  }

  protected handleCanvasMouseup = (event: MouseEvent) => {
    const candidates = this.getEventsAtPoint(event.offsetX, event.offsetY);

    if (candidates.length > 0) {
      this.selectEvents(candidates, { append: checkControlCommandKey(event), toggle: true });
    } else {
      this.selectEvents([]);
    }
  };

  protected handleCanvasContextmenu = (event: MouseEvent) => {
    event.preventDefault();
    const candidates = this.getEventsAtPoint(event.offsetX, event.offsetY);

    const candidate = candidates.length > 0 ? candidates[0] : undefined;

    this.host.dispatchEvent(
      new CustomEvent("openContextmenu", {
        detail: {
          event: candidate,
          relativeX: event.clientX,
          relativeY: event.clientY,
        },
      })
    );
  };

  protected handleCanvasMousemove = (event: MouseEvent) => {
      event.preventDefault();
      const candidates = this.getEventsAtPoint(event.offsetX, event.offsetY);
      const candidate = candidates.length > 0 ? candidates[0] : undefined;

      if (this.activeEvent && (this.activeEvent !== candidate || !candidate)) {
          this.host.dispatchEvent(
              new CustomEvent('leftEvent',{
                  detail: {
                      event: this.activeEvent
                  }
              })
          );
      }

      if (!candidate) {
          this.activeEvent = null;
          return;
      }

      const api = this.canvasApi;
      this.activeEvent = candidate;

      this.host.dispatchEvent(
          new CustomEvent('hoverEvent',{
              detail: {
                  events: candidates,
                  time: api.positionToTime(event.offsetX),
                  offset: {
                      x: event.offsetX,
                      y: event.offsetY,
                  }
              }
          })
      );
  }

  protected getEventIdentity: (event: Event) => EventIdentity = (event) => {
      return `${event.renderType}:${event.axisId}:${event.from}-${event.to}`;
  }

  protected renderers = new Map<string, AbstractEventRenderer>([
    ["event", new EventGroupRenderer()],
    ["process", new ProcessGroupRenderer()],
  ]);

  protected maxIndexTreeWidth = 16;

  protected index = new RBush<BBox & { event: Event }>(this.maxIndexTreeWidth);

  protected rebuildIndex(): void {
    const api = this.canvasApi;
    const axesComponent = api.getComponent(Axes)!;
    const boxes = this._events.map((event): BBox & { event: Event } => {
        const axis = axesComponent.axesById[event.axisId];
        const eventTrackY = axesComponent.getAxisTrackPosition(axis, event.trackIndex);

        const minX = event.from;
        const maxX = event.to ? event.to : minX + 1;
        const minY = eventTrackY - axesComponent.lineHeight / 2;
        const maxY = eventTrackY + axesComponent.lineHeight / 2;
        return { minX, maxX, minY, maxY, event };
    });
    this.index.clear();
    this.index.load(boxes);
  }

  private _selectedEvents = new Set<EventIdentity>();

  private _events: Event[] = [];
}

export type SelectOptions = {
  append?: boolean;
  toggle?: boolean;
  contextmenu?: boolean;
};
