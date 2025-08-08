import {TimelineJob} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {
    IncarnationMarker,
    IncarnationMarkerRenderer,
} from '../../../../../../components/TimelineBlock/renderer/IncarnationMarkerRenderer';

type Props = (jobs: TimelineJob[]) => IncarnationMarker[];

export const prepareMarkers: Props = (jobs) => {
    const incarnationMap = new Map<string, number>();

    jobs.forEach(({incarnation, events}) => {
        if (!incarnation || !events.length) return;

        const item = incarnationMap.get(incarnation);
        const start = events[0].startTime;
        if (item) {
            const newTime = Math.min(item, start);
            incarnationMap.set(incarnation, newTime);
        } else {
            incarnationMap.set(incarnation, start);
        }
    });

    return Array.from(incarnationMap.entries()).map(([incarnation, time]) => ({
        time,
        color: 'rgba(143, 82, 204, 0.8)',
        hoverColor: 'rgb(254, 127, 45)',
        activeColor: 'rgb(254, 127, 45)',
        labelBackgroundColor: 'rgba(143, 82, 204)',
        label: incarnation,
        incarnationId: incarnation,
        lineWidth: 2,
        renderer: new IncarnationMarkerRenderer<IncarnationMarker>(),
    }));
};
