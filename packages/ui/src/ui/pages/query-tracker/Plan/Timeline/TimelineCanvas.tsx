import {wrapWc} from 'wc-react';
import {
    AreaSelectionComponent,
    Axes,
    BasicEventsProvider,
    BoundsChangedEvent,
    Events,
    EventsSelectedEvent,
    Grid,
    ScrollTopChangedEvent,
    TimelineAxis,
    TimelineComponent,
    TimelineEvent,
    TimelineMarker,
    YaTimeline,
    yaTimelineConfig,
} from '../../../../packages/ya-timeline';
import {YEAR} from '../../../../packages/ya-timeline/definitions';
import {getCSSPropertyValue} from '../styles';

import {OperationRenderer} from './OperationRenderer';

export type EventGroup = TimelineEvent & {
    eventsCount: number;
};

export class TimelineCanvas extends YaTimeline {
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

    set theme(_theme: string) {
        this.setTimelineConfig();
        this.scheduleTimelineRender();
    }

    override updateCanvasSize() {
        if (this.offsetHeight) {
            return super.updateCanvasSize();
        }
        return;
    }

    createComponents(): TimelineComponent[] {
        this.setTimelineConfig();
        const events = new Events(this);
        events.registerRenderer('operation', new OperationRenderer());
        return [
            new Grid(this),
            new Axes(this),
            events,
            new AreaSelectionComponent(this),
            new BasicEventsProvider<EventGroup>(this),
        ];
    }

    private setTimelineConfig() {
        yaTimelineConfig.ZOOM_MAX = YEAR * 3;

        yaTimelineConfig.PRIMARY_BACKGROUND_COLOR = getCSSPropertyValue(
            '--g-color-base-background',
        );

        yaTimelineConfig.SECONDARY_MARK_COLOR = getCSSPropertyValue('--g-color-line-generic');
        yaTimelineConfig.BOUNDARY_MARK_COLOR = getCSSPropertyValue('--g-color-line-generic');
        yaTimelineConfig.PRIMARY_MARK_COLOR = getCSSPropertyValue('--g-color-line-generic-hover');
        yaTimelineConfig.COUNTER_FONT_COLOR = getCSSPropertyValue('--g-color-text-complementary');
    }
}

customElements.define('my-timeline-canvas', TimelineCanvas);

interface TimelineProps {
    start: number;
    end: number;
    canvasScrollTop?: number;
    isZoomAllowed?: boolean;
    scrollTopChanged?: (event: ScrollTopChangedEvent) => void;
    boundsChanged?: (event: BoundsChangedEvent) => void;
    eventsSelected?: (event: EventsSelectedEvent<TimelineEvent>) => void;

    axes: TimelineAxis[];
    markers?: TimelineMarker[];
    events?: EventGroup[];
    theme: string;
}

export const Timeline = wrapWc<TimelineProps>('my-timeline-canvas');
