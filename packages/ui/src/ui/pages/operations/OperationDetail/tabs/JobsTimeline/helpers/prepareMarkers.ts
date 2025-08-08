import {TimelineJob} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {TimelineMarker} from '@gravity-ui/timeline';

type Props = (jobs: TimelineJob[]) => TimelineMarker[];

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
        labelBackgroundColor: 'rgba(143, 82, 204, 0.15)',
        label: incarnation,
    }));
};
