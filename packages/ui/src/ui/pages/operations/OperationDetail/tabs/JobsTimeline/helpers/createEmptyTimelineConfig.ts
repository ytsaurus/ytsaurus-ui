import {TimeLineConfig, TimelineEvent, TimelineMarker} from '@gravity-ui/timeline';

export const createEmptyTimelineConfig = <
    TEvent extends TimelineEvent,
    TMarker extends TimelineMarker,
>(
    viewConfiguration: TimeLineConfig<TEvent, TMarker>['viewConfiguration'],
): TimeLineConfig<TEvent, TMarker> => ({
    settings: {
        start: 0,
        end: 0,
        axes: [],
        events: [],
        markers: [],
        selectedEventIds: [],
    },
    viewConfiguration,
});
