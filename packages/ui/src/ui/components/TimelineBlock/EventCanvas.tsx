import {wrapWc} from 'wc-react';
import {
    Axes,
    BasicEventsProvider,
    BoundsChangedEvent,
    Events,
    EventsSelectedEvent,
    Grid,
    TimelineAxis,
    TimelineComponent,
    TimelineEvent,
    TimelineMarker,
    YaTimeline,
    yaTimelineConfig,
} from '../../packages/ya-timeline';
import {EventGroup} from '../../pages/query-tracker/Plan/Timeline/TimelineCanvas';
import {
    AbstractEventRenderer,
    EventIdentity,
    HoverEvent,
    LeftEvent,
} from '../../packages/ya-timeline/components/Events';
import {getCSSPropertyValue} from '../../utils/get-css-color';
import {
    ROW_HEIGHT,
    TIMELINE_HEIGHT,
    TIMELINE_SELECT_BORDER_WIDTH,
} from '../../pages/operations/OperationDetail/tabs/JobsTimeline/constants';

export type TimelineRenderer = {
    id: string;
    renderer: AbstractEventRenderer;
};

export class EventCanvas<T extends TimelineEvent> extends YaTimeline {
    private renderersList: TimelineRenderer[] = [];

    set renderers(value: TimelineRenderer[]) {
        this.renderersList = value;
        this.scheduleTimelineRender();
    }

    set events(value: EventGroup[]) {
        this.getComponent(BasicEventsProvider).then((component) => {
            component?.setEvents(value);
        });
    }

    set axes(axes: TimelineAxis[]) {
        this.getComponent(BasicEventsProvider).then((component) => {
            if (component) {
                component.axes = axes;
            }
        });
    }

    set selectedEvents(events: EventIdentity[]) {
        this.getComponent(BasicEventsProvider).then((component) => {
            if (component) {
                component.setSelectedEvents(events);
            }
        });
    }

    set theme(_theme: string) {
        this.setTimelineConfig();
        this.scheduleTimelineRender();
    }

    override updateCanvasSize() {
        if (this.offsetHeight) {
            return super.updateCanvasSize();
        }

        return () => {};
    }

    createComponents(): TimelineComponent[] {
        this.setTimelineConfig();
        const events = new Events(this);

        this.renderersList.forEach(({id, renderer}) => {
            events.registerRenderer(id, renderer);
        });

        return [new Grid(this), new Axes(this), events, new BasicEventsProvider<T>(this)];
    }

    private setTimelineConfig() {
        yaTimelineConfig.OVERLAPPING_THRESHOLD = 0;
        yaTimelineConfig.SKIP_OVERLAPPING = true;
        yaTimelineConfig.PRIMARY_BACKGROUND_COLOR = getCSSPropertyValue(
            '--g-color-base-background',
        );
        yaTimelineConfig.SELECTION_OUTLINE_THICKNESS = TIMELINE_SELECT_BORDER_WIDTH;
        yaTimelineConfig.TRACK_HEIGHT = ROW_HEIGHT;
        yaTimelineConfig.LINE_HEIGHT = TIMELINE_HEIGHT;
    }
}

customElements.define('events-timeline-canvas', EventCanvas);

interface TimelineProps<T extends TimelineEvent> {
    start: number;
    end: number;
    selectedEvents?: EventIdentity[];
    eventsSelected?: (event: EventsSelectedEvent<T>) => void;
    hoverEvent?: (event: HoverEvent<T>) => void;
    leftEvent?: (event: LeftEvent<T>) => void;
    axes: TimelineAxis[];
    theme: string;
    markers?: TimelineMarker[];
    events?: T[];
    isZoomAllowed?: boolean;
    boundsChanged?: (event: BoundsChangedEvent) => void;
    renderers: TimelineRenderer[];
}

export const Timeline = wrapWc<TimelineProps<TimelineEvent>>('events-timeline-canvas') as <
    T extends TimelineEvent,
>(
    props: TimelineProps<T>,
) => JSX.Element;
