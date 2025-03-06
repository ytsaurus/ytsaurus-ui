import {clamp, inexactEqual, rangeToRangeIntersect} from "../../math";
import {TimelineAxis} from "../components/Axes";
import {TimelineEvent} from "../components/Events";
import {yaTimelineConfig} from "../config";
import {UnixTimestampMs} from "../definitions";
import {AxesIndex} from "./AxesIndex";
import {ContinuousRange} from "./Range";
import {noop} from "./utils";

// All callbacks are assumed to mutate event given as 1st argument
type MapFn<RawEvent, Event extends TimelineEvent> = (candidate: Partial<Event>, raw: RawEvent) => void;
type MergeFn<Event extends TimelineEvent> = (prev: Event, next: Event) => void;
type PostProcessFn<Event extends TimelineEvent> = (event: Event) => void;

export type EventMapperOptions<Event extends TimelineEvent, RawEvent, Axis extends TimelineAxis = TimelineAxis> = {
  mapEvent: MapFn<RawEvent, Event>;
  merge?: MergeFn<Event>;
  postProcess?: PostProcessFn<Event>;
  overlapThreshold?: number;
  skipOverlap?: boolean;
  getAxisIdentity?: (axis: Axis) => string;

  onVisibleEventsChanged: (events: Event[]) => void;
};

/**
 * Indicates that EventMapper must try to find free track for the event
 */
export const AUTO_TRACK = -1;

export class EventMapper<
  Event extends TimelineEvent = TimelineEvent,
  RawEvent = TimelineEvent,
  Axis extends TimelineAxis = TimelineAxis
> {
  public set getRawEvents(getRawEvents: () => Generator<RawEvent, void, void>) {
    this._getRawEvents = getRawEvents;
    this.foldEvents();
    this.recalcVisibility();
    this.onVisibleEventsChanged(this.visibleEvents);
  }

  public set axes(axes: Axis[]) {
    this.axesIndex.axes = axes;
    this.foldEvents();
    this.recalcVisibility();
    this.onVisibleEventsChanged(this.visibleEvents);
  }

  public get axes(): Axis[] {
    return this.axesIndex.axes;
  }

  public set timeRange(range: ContinuousRange) {
    const oldRange = this._timeRange;
    this._timeRange = range;
    if (inexactEqual(range.length, oldRange.length, 0.1)) {
      this.recalcVisibility();
    } else {
      this.foldEvents();
      this.recalcVisibility();
    }
    this.onVisibleEventsChanged(this.visibleEvents);
  }

  public get timeRange(): ContinuousRange {
    return this._timeRange;
  }

  public set viewportWidth(width: number) {
    this._viewportWidth = width;
    this.foldEvents();
    this.recalcVisibility();
    this.onVisibleEventsChanged(this.visibleEvents);
  }

  private getAxisIdentity = (axis: Axis) => {
    return axis.id;
  };

  constructor(options: EventMapperOptions<Event, RawEvent, Axis>) {
    Object.assign(this, options);

    this.axesIndex = new AxesIndex([], { identityFunction: this.getAxisIdentity });
  }

  protected visibleEvents: Event[] = [];

  protected recalcVisibility() {
    this.visibleEvents.length = 0;
    const events = this.foldedEvents;

    for (let i = 0, len = events.length; i < len; i += 1) {
      const event = events[i];
      if (rangeToRangeIntersect(this._timeRange.from, this._timeRange.to, event.from, event.to || event.from)) {
        this.visibleEvents.push(event);
      }
    }

    return this.visibleEvents;
  }

  protected foldedEvents: Event[] = [];

  protected clampEventTrackIndex(event: Event, axis: Axis): number {
    return clamp(event.trackIndex, -1, axis.tracksCount - 1);
  }

  protected foldEvents(): void {
    this.foldedEvents.length = 0;

    const rawEvents = this._getRawEvents();

    const memo = this.axesIndex.axes.reduce((acc, axis) => {
      acc[this.getAxisIdentity(axis)] = [];
      return acc;
    }, {} as { [axisId: string]: Event[] });

    let candidate: Event = Object.create(null) as Event;

    // Iteration assumes events sorted in ascending order
    for (const rawEvent of rawEvents) {
      this.mapEvent(candidate, rawEvent);
      candidate.eventsCount = 1;

      const axisId = candidate.axisId!;
      const axis = this.axesIndex.axesById[axisId];

      if (!axis) continue;

      let trackIndex = this.clampEventTrackIndex(candidate, axis);

      if (trackIndex === AUTO_TRACK) {
        trackIndex = 0;

        while (trackIndex < axis.tracksCount) {
          const lastOnTrack = memo[axisId][trackIndex];
          const isOverlapping = lastOnTrack && this.isOverlapping(lastOnTrack, candidate);
          if (!isOverlapping) break;
          trackIndex += 1;
        }

        trackIndex = clamp(trackIndex, 0, axis.tracksCount - 1);
        candidate.trackIndex = trackIndex;
      }

      const lastOnTrack = memo[axisId][trackIndex];

      if (!lastOnTrack) {
        memo[axisId][trackIndex] = candidate;
        candidate = Object.create(null);
      } else if (this.isOverlapping(lastOnTrack, candidate) && !this.skipOverlap) {
        lastOnTrack.eventsCount += candidate.eventsCount;
        lastOnTrack.from = Math.min(lastOnTrack.from, candidate.from);
        lastOnTrack.to = Math.max(lastOnTrack.to!, candidate.to!);
        this.mergeEvents(lastOnTrack, candidate);
      } else {
        this.finalizeEvent(lastOnTrack);
        this.foldedEvents.push(lastOnTrack);
        memo[axisId][trackIndex] = candidate;
        candidate = Object.create(null);
      }
    }

    for (const tracks of Object.values(memo)) {
      for (const lastOnTrack of tracks) {
        if (!lastOnTrack) {
          continue;
        }
        this.finalizeEvent(lastOnTrack);
        this.foldedEvents.push(lastOnTrack);
      }
    }
  }

  protected isOverlapping(left: Event, right: Event): boolean {
    return (
      rangeToRangeIntersect(left.from, left.to!, right.from, right.to!) ||
      this.timeToWidth(right.from - left.to!) <= this.overlapThreshold
    );
  }

  protected timeToWidth(time: UnixTimestampMs): number {
    return (time * this._viewportWidth) / this._timeRange.length;
  }

  protected _timeRange = new ContinuousRange(0, 0);

  protected _viewportWidth = 0;

  protected axesIndex!: AxesIndex<Axis>;

  protected _getRawEvents: () => Generator<RawEvent, void, void> = function* empty() {
    yield* [];
  };

  protected readonly mapEvent!: MapFn<RawEvent, Event>;

  protected readonly mergeEvents: MergeFn<Event> = noop;

  protected readonly finalizeEvent: PostProcessFn<Event> = noop;

  protected readonly overlapThreshold: number = yaTimelineConfig.OVERLAPPING_THRESHOLD;

  protected readonly skipOverlap: boolean = yaTimelineConfig.SKIP_OVERLAPPING;

  protected readonly onVisibleEventsChanged: (events: Event[]) => void = noop;
}
