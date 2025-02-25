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
} from '../../../../../../packages/ya-timeline';
import {EventGroup} from '../../../../../query-tracker/Plan/Timeline/TimelineCanvas';
import {
    EventIdentity,
    HoverEvent,
    LeftEvent,
} from '../../../../../../packages/ya-timeline/components/Events';
import {JobLineEvent, JobLineRenderer} from './renderer/JobLineRenderer';
import {getCSSPropertyValue} from '../../../../../query-tracker/Plan/styles';
import {ROW_HEIGHT, TIMELINE_HEIGHT, TIMELINE_SELECT_BORDER_WIDTH} from '../constants';
import {AllocationLineEvent, AllocationLineRenderer} from './renderer/AllocationLineRenderer';

export class EventCanvas extends YaTimeline {
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
        events.registerRenderer('jobLine', new JobLineRenderer());
        events.registerRenderer('allocationLine', new AllocationLineRenderer());
        return [
            new Grid(this),
            new Axes(this),
            events,
            new BasicEventsProvider<JobLineEvent>(this),
        ];
    }

    private setTimelineConfig() {
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
    events?: (JobLineEvent | AllocationLineEvent)[];
    isZoomAllowed?: boolean;
    boundsChanged?: (event: BoundsChangedEvent) => void;
}

export const Timeline = wrapWc<TimelineProps<JobLineEvent>>('events-timeline-canvas');
