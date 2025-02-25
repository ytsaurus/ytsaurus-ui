import {JobsTimelineState} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {JobLineEvent} from '../../../../../../components/TimelineBlock/renderer/JobLineRenderer';
import {getColorByState} from '../../../../../../components/TimelineBlock/helpers/getColorByState';
import {AllocationLineEvent} from '../../../../../../components/TimelineBlock/renderer/AllocationLineRenderer';
import {getTimeLineDisplayMode} from './getTimeLineDisplayMode';

interface AllocationData {
    from: number;
    to: number;
    cookieId: string;
}

export const prepareJobTimeline = ({
    jobs,
    selectedJob = [],
    filter = '',
    axesRowHeight = 0,
}: {
    jobs: JobsTimelineState['jobs'];
    selectedJob?: string[];
    filter?: string;
    axesRowHeight: number;
}) => {
    // Process allocations
    const allocationMap = new Map<string, AllocationData>();
    const validJobs = jobs.filter((job) => job.cookieId !== undefined);

    for (const job of validJobs) {
        if (!job.allocationId) continue;

        const firstEvent = job.events[0];
        const lastEvent = job.events[job.events.length - 1];
        const jobStartTime = firstEvent.startTime;
        const jobEndTime = lastEvent.endTime;
        const cookieId = job.cookieId.toString();

        const existingAllocation = allocationMap.get(job.allocationId);

        if (existingAllocation) {
            existingAllocation.from = Math.min(existingAllocation.from, jobStartTime);
            existingAllocation.to = Math.max(existingAllocation.to, jobEndTime);
        } else {
            allocationMap.set(job.allocationId, {
                from: jobStartTime,
                to: jobEndTime,
                cookieId,
            });
        }
    }

    // Convert allocations to events
    const allocations: AllocationLineEvent[] = Array.from(allocationMap.entries()).map(
        ([allocationId, allocation]) => ({
            renderType: 'allocationLine' as const,
            allocationId,
            axisId: allocation.cookieId,
            eventsCount: 1,
            trackIndex: 0,
            from: allocation.from,
            to: allocation.to,
        }),
    );

    // Process jobs and collect axes
    const axes = new Set<string>();
    const timelines: JobLineEvent[] = [];

    for (const job of validJobs) {
        const cookieId = job.cookieId.toString();
        axes.add(cookieId);

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
            renderType: 'jobLine' as const,
            axisId: cookieId,
            eventsCount: jobEvents.length,
            trackIndex: 0,
            from: firstEvent.startTime,
            to: lastEvent.endTime,
            jobId: job.id,
            parts,
            displayMode: getTimeLineDisplayMode({
                jobId: job.id,
                timeLineId: `jobLine:${cookieId}:${firstEvent.startTime}-${lastEvent.endTime}`,
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

    // Prepare axis
    const axesArray = Array.from(axes).map((id, index) => ({
        id,
        top: axesRowHeight * index,
        height: axesRowHeight,
        tracksCount: 1,
    }));

    return {
        axes: axesArray,
        timelines: [...timelines, ...allocations],
    };
};
