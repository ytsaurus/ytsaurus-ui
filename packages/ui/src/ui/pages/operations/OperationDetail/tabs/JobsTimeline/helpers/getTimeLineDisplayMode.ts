import {EventDisplayMode} from '../../../../../../components/TimelineBlock/enums';

export const getTimeLineDisplayMode = ({
    jobId,
    filter = '',
    selectedJob = [],
    selectedByIncarnation = false,
}: {
    jobId: string;
    filter?: string;
    selectedJob?: string[];
    selectedByIncarnation?: boolean;
}): EventDisplayMode => {
    if (selectedByIncarnation) {
        return EventDisplayMode.FoundIncarnation;
    }

    const hasFilter = Boolean(filter);
    const hasSelectedJobs = selectedJob && Boolean(selectedJob[0]);
    const matchesFilter = hasFilter && jobId.includes(filter);
    const isSelected = selectedJob[0] === jobId;

    if (matchesFilter && isSelected) {
        return EventDisplayMode.SelectedFound;
    }

    if (matchesFilter) {
        return EventDisplayMode.Found;
    }

    if (isSelected) {
        return EventDisplayMode.Selected;
    }

    if (hasFilter || hasSelectedJobs) {
        return EventDisplayMode.Transparent;
    }

    return EventDisplayMode.Default;
};
