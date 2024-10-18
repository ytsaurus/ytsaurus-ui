import {NodeProgress} from '../../models/plan';

export const GRAPH_COLORS = {
    text: '#000',
    border: '#e5e5e5',
    selectedBorder: '#cecece',
    progressBorder: '#69AA699E',
    background: '#fff',
    selectedBackground: '#f2f2f2',
    progressColor: '#E5F8E4',
    aborted: '#ddd',
    failed: '#f40505',
    jobBlockBackground: '#4C4C4C',
    jobBlockColor: '#fff',
};

export const JOBS_COLOR_MAP = {
    completed: '#3BC935CC',
    pending: '#4E79EB',
    aborted: '#FFDB4D',
    failed: '#EA0805',
};

export const NodeProgressMap: Record<
    Required<NodeProgress>['state'],
    {percent: number; color: string}
> = {
    Started: {percent: 10, color: GRAPH_COLORS.progressColor},
    InProgress: {percent: 45, color: GRAPH_COLORS.progressColor},
    Finished: {percent: 100, color: GRAPH_COLORS.progressColor},
    Aborted: {percent: 100, color: GRAPH_COLORS.aborted},
    Failed: {percent: 100, color: GRAPH_COLORS.failed},
};
