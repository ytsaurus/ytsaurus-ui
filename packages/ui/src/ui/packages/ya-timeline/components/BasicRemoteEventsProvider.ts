import debounce_ from 'lodash/debounce';
import {YaTimeline} from '../YaTimeline';
import {UnixTimestampMs} from '../definitions';
import {
    AbstractTimelineDataLoader,
    Region,
    RegionState,
    TimelineRegionsManagerOptions,
} from '../lib/AbstractTimelineDataLoader';
import {EventMapper} from '../lib/EventMapper';
import {ContinuousRange} from '../lib/Range';
import {Axes, TimelineAxis} from './Axes';
import {Events, TimelineEvent} from './Events';
import {LoaderRegions} from './LoaderRegions';
import {TimelineComponent} from './TimelineComponent';

type Loader<T extends TimelineEvent> = (from: UnixTimestampMs, to: UnixTimestampMs) => Promise<T[]>;

type EventsRegion<T extends TimelineEvent> = Readonly<Region> & {
    events: T[];
};

export class BasicRemoteEventsProvider<T extends TimelineEvent> extends TimelineComponent {
    public set axes(axes: TimelineAxis[]) {
        if (axes !== this.mapper.axes) {
            this.mapper.axes = axes;
            const axesComponent = this.canvasApi.getComponent(Axes);
            if (axesComponent) {
                axesComponent.axes = axes;
            }
        }
    }

    public get axes(): TimelineAxis[] {
        return this.mapper.axes;
    }

    constructor(
        host: YaTimeline,
        options: {
            loadWindow: Loader<T>;
        },
    ) {
        super(host);

        Object.assign(this, options);

        this.loader = new BasicTimelineEventsLoader<T>({
            loadWindow: options.loadWindow,
            onRegionProcessed: this.handleRegionProcessed,
            onRegionsChanged: this.handleRegionsChanged,
        });
        this.mapper = new EventMapper<T, T>({
            mapEvent: (event: Partial<T>, rawEvent: T) => {
                Object.assign(event, rawEvent);
            },
            onVisibleEventsChanged: this.handleVisibleEventsChanged,
        });
    }

    public hostConnected() {
        this.loader.startProcessing();
        this.mapper.viewportWidth = this.canvasApi.canvas.width;
        this.handleTimeRangeChanged(new ContinuousRange(this.host.start, this.host.end));
    }

    public hostDisconnected() {
        this.loader.stopProcessing();
    }

    public hostUpdated() {
        const newRange = new ContinuousRange(this.host.start, this.host.end);
        this.handleTimeRangeChanged(newRange);
    }

    protected handleTimeRangeChanged = debounce_((newRange: ContinuousRange): void => {
        const oldRange = this.loader.timeRange;

        if (!oldRange.equals(newRange)) {
            this.loader.timeRange = newRange;
            this.mapper.timeRange = newRange;
        }
    }, 250);

    protected handleRegionProcessed = (): void => {
        this.mapper.getRawEvents = () => this.loader.getAllEvents();
    };

    protected handleRegionsChanged = (regions: EventsRegion<T>[]): void => {
        const loadingIndicator = this.canvasApi.getComponent(LoaderRegions);
        if (loadingIndicator) {
            loadingIndicator.regions = regions;
        }
    };

    protected handleVisibleEventsChanged = (events: T[]): void => {
        const eventComponent = this.canvasApi.getComponent(Events)!;
        eventComponent.events = events;
        this.host.scheduleTimelineRender();
    };

    protected readonly loader: BasicTimelineEventsLoader<T>;

    protected readonly mapper: EventMapper<T, T>;

    protected unsubscribe: VoidFunction | undefined;
}

class BasicTimelineEventsLoader<T extends TimelineEvent> extends AbstractTimelineDataLoader<
    EventsRegion<T>
> {
    constructor(options: TimelineRegionsManagerOptions<EventsRegion<T>> & {loadWindow: Loader<T>}) {
        super(options);
        Object.assign(this, options);
    }

    public *getAllEvents(): Generator<T, void, undefined> {
        for (const region of this.regions) {
            if (region.state === RegionState.PROCESSED) {
                yield* region.events;
            }
        }
    }

    protected async processRegion(region: EventsRegion<T>): Promise<void> {
        region.events = await this.loadWindow(region.time.from, region.time.to);
    }

    protected readonly loadWindow!: Loader<T>;
}
