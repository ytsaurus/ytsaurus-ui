import {makeObjectWithDelayedInit} from '../../../utils/delayed-init';
import {getCssColor} from '../../../utils/get-css-color';

const GRAPH_COLORS_ = {
    text: () => getCssColor('--yql-graph-color-text-label'),
    secondary: () => getCssColor('--g-color-text-secondary'),
    border: () => getCssColor('--yql-graph-color-edge'),
    selectedBorder: () => getCssColor('--yql-graph-color-edge-highlight'),
    progressBorder: () => getCssColor('--info-color'),
    background: () => getCssColor('--g-color-base-generic-ultralight'),
    selectedBackground: () => getCssColor('--hover-background'),
    progressColor: () => 'rgba(59, 201, 53, 0.15)',
    aborted: () => getCssColor('--default-background'),
    failed: () => getCssColor('--g-color-base-danger-heavy'),
    jobBlockBackground: () => 'rgba(88, 106, 122, 1)',
    jobBlockColor: () => getCssColor('--g-color-text-brand'),
    icon: () => getCssColor('--yql-graph-icon-color'),
};

const STATE_COLOR_MAP_ = {
    completed: () => getCssColor('--success-color'),
    pending: () => getCssColor('--info-color'),
    aborted: () => getCssColor('--yellow-color'),
    failed: () => getCssColor('--danger-color'),
};

export const GRAPH_COLORS = makeObjectWithDelayedInit(GRAPH_COLORS_, {
    skipUndefined: true,
    defaultValue: '',
});
export const STATE_COLOR_MAP = makeObjectWithDelayedInit(STATE_COLOR_MAP_, {
    skipUndefined: true,
    defaultValue: '',
});
