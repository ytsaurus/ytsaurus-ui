import {JobLineRenderer} from '../../../../../../components/TimelineBlock/renderer/JobLineRenderer';
import {ROW_HEIGHT} from '../constants';
import {
    MarkerDeselectionMode,
    TimeLineConfig,
    TimelineEvent,
    TimelineMarker,
    TimelineSection,
} from '@gravity-ui/timeline';

export const createTimelineConfig = <
    TEvent extends TimelineEvent,
    TMarker extends TimelineMarker,
    TSection extends TimelineSection,
>(): TimeLineConfig<TEvent, TMarker, TSection> => ({
    settings: {
        start: 0,
        end: 0,
        axes: [],
        events: [],
        markers: [],
        selectedEventIds: [],
        markerDeselectionMode: MarkerDeselectionMode.ON_MARKER_CLICK_ONLY,
        clickEventsCollectionFilter: (candidates) => {
            return candidates
                .filter((event) => event.renderer instanceof JobLineRenderer)
                .splice(0, 1);
        },
        clickMarkerCollectionFilter: (candidates) => {
            const group = candidates.find((candidate) => 'group' in candidate);
            if (group) return [group];

            return candidates.splice(0, 1);
        },
    },
    viewConfiguration: {
        axes: {
            trackHeight: ROW_HEIGHT,
            lineHeight: 12,
        },
        markers: {
            collapseMinDistance: 10,
        },
        hideRuler: true,
    },
});
