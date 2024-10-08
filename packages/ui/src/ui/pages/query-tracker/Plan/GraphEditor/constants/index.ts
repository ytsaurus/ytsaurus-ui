import {getColor} from '../helpers/getColor';

export const GRAPH_COLORS = {
    text: getColor('--yql-graph-color-text-label'),
    border: getColor('--yql-graph-color-edge'),
    selectedBorder: getColor('--yql-graph-color-edge-highlight'),
    progressBorder: getColor('--info-color'),
    background: getColor('--g-color-base-generic-ultralight'),
    selectedBackground: getColor('--hover-background'),
    progressColor: 'rgba(59, 201, 53, 0.15)', //getColor('--g-color-base-positive-light'),
    aborted: '#ddd',
    failed: '#f40505',
    jobBlockBackground: '#4C4C4C',
    jobBlockColor: '#fff',
};

export const JOBS_COLOR_MAP = {
    completed: getColor('--success-color'),
    pending: getColor('--info-color'),
    aborted: getColor('--yellow-color'),
    failed: getColor('--danger-color'),
};
