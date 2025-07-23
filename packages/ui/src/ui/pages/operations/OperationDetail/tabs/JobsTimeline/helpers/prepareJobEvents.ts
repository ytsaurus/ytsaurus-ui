import {JobsTimelineState} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {
    JobLineEvent,
    JobLineRenderer,
} from '../../../../../../components/TimelineBlock/renderer/JobLineRenderer';
import {getColorByState} from '../../../../../../components/TimelineBlock/helpers/getColorByState';
import {
    AllocationLineEvent,
    AllocationLineRenderer,
} from '../../../../../../components/TimelineBlock/renderer/AllocationLineRenderer';
import {getTimeLineDisplayMode} from './getTimeLineDisplayMode';
import {getJobTrackId} from './getJobTrackId';

interface AllocationData {
    from: number;
    to: number;
    trackId: string;
}

const AXIS_ID = 'main';

export const prepareJobEvents = ({
    jobs,
    selectedJob = [],
    filter = '',
}: {
    jobs: JobsTimelineState['jobs'];
    selectedJob?: string[];
    filter?: string;
}) => {
    // Process allocations
    const allocationMap = new Map<string, AllocationData>();

    const trackIdSet = new Set<string>();
    for (const job of jobs) {
        if (!job.allocationId) continue;

        const firstEvent = job.events[0];
        const lastEvent = job.events[job.events.length - 1];
        const jobStartTime = firstEvent.startTime;
        const jobEndTime = lastEvent.endTime;
        const trackId = getJobTrackId(job);
        trackIdSet.add(trackId);

        const existingAllocation = allocationMap.get(job.allocationId);

        if (existingAllocation) {
            existingAllocation.from = Math.min(existingAllocation.from, jobStartTime);
            existingAllocation.to = Math.max(existingAllocation.to, jobEndTime);
        } else {
            allocationMap.set(job.allocationId, {
                from: jobStartTime,
                to: jobEndTime,
                trackId,
            });
        }
    }

    const cookieIds = Array.from(trackIdSet);

    // Convert allocations to events
    const allocations: AllocationLineEvent[] = Array.from(allocationMap.entries()).map(
        ([allocationId, allocation]) => ({
            id: allocationId,
            axisId: AXIS_ID,
            trackIndex: cookieIds.indexOf(allocation.trackId),
            from: allocation.from,
            to: allocation.to,
            renderer: new AllocationLineRenderer(),
            allocationId,
        }),
    );

    // Process jobs and collect axes
    const timelines: JobLineEvent[] = [];

    for (const job of jobs) {
        const trackId = getJobTrackId(job);

        const jobEvents = job.events;
        const firstEvent = jobEvents[0];
        const lastEvent = jobEvents[jobEvents.length - 1];

        const parts = jobEvents.map((event) => ({
            percentage: event.percent,
            color: getColorByState(event.state),
            state: event.state,
            interval: {
                from: event.startTime,
                to: event.endTime,
            },
            phases: event.phases,
        }));

        timelines.push({
            id: job.id,
            axisId: AXIS_ID,
            trackIndex: cookieIds.indexOf(trackId),
            from: firstEvent.startTime,
            to: lastEvent.endTime,
            renderer: new JobLineRenderer(),
            jobId: job.id,
            parts,
            displayMode: getTimeLineDisplayMode({
                jobId: job.id,
                filter,
                selectedJob,
            }),
            meta: {
                startTime: job.start_time,
                endTime: job.finish_time,
                address: job.address,
                allocationId: job.allocationId,
            },
        });
    }

    return [...allocations, ...timelines];
};
