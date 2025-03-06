import debounce_ from 'lodash/debounce';
import {YaTimeline} from '../YaTimeline';
import {EventMapper} from '../lib/EventMapper';
import {ContinuousRange} from '../lib/Range';
import {Axes, TimelineAxis} from './Axes';
import {EventIdentity, Events, TimelineEvent} from './Events';
import {TimelineComponent} from './TimelineComponent';

export class BasicEventsProvider<T extends TimelineEvent> extends TimelineComponent {
    public appendEvents(newEvents: T[]): void {
        this.events = this.events.concat(newEvents);
        this.notifyMapperEvents();
    }

    public setEvents(newEvents: T[]): void {
        this.events = newEvents;
        this.notifyMapperEvents();
    }

    public setSelectedEvents(events: EventIdentity[]): void {
        const eventsComponent = this.canvasApi.getComponent(Events);
        if (eventsComponent) {
            eventsComponent.selectedEvents = events;
        }
    }

    public set axes(axes: TimelineAxis[]) {
        if (axes !== this.mapper.axes) {
            // TODO(danila-shutov): Fix data-flow between components
            // Setting mapper axis, synchronously triggers onVisibleEventsChanged
            // which in turn, causes call to Events.rebuildIndex.
            // Axes are required there, so order here is important.
            // 1. Update axes on Axes component
            // 2. Update axes on mapper

            const axesComponent = this.canvasApi.getComponent(Axes);
            if (axesComponent) {
                axesComponent.axes = axes;
            }

            this.mapper.axes = axes;
        }
    }

    public get axes(): TimelineAxis[] {
        return this.mapper.axes;
    }

    constructor(host: YaTimeline) {
        super(host);

        this.mapper = new EventMapper<T, T>({
            mapEvent: (event: Partial<T>, rawEvent: T) => {
                Object.assign(event, rawEvent);
            },
            onVisibleEventsChanged: this.handleVisibleEventsChanged,
        });
    }

    public hostConnected() {
        this.mapper.viewportWidth = this.canvasApi.canvas.width;
        this.handleTimeRangeChanged(new ContinuousRange(this.host.start, this.host.end));
    }

    public hostUpdated() {
        const newRange = new ContinuousRange(this.host.start, this.host.end);
        this.handleTimeRangeChanged(newRange);
    }

    protected handleTimeRangeChanged = debounce_((newRange: ContinuousRange): void => {
        const oldRange = this.mapper.timeRange;

        if (!oldRange.equals(newRange)) {
            this.mapper.timeRange = newRange;
        }
    }, 250);

    protected handleVisibleEventsChanged = (events: T[]): void => {
        const eventComponent = this.canvasApi.getComponent(Events)!;
        eventComponent.events = events;
        this.host.scheduleTimelineRender();
    };

    protected notifyMapperEvents(): void {
        const events = this.events;

        function* iterateAllEvents() {
            yield* events;
        }

        // This assignment triggers recalculation of visible events
        this.mapper.getRawEvents = iterateAllEvents;
    }

    protected readonly mapper: EventMapper<T, T>;

    protected events: T[] = [];
}
