import React from 'react';
import block from 'bem-cn-lite';

import hammer from '../../common/hammer';
import Icon, {IconName} from '../Icon/Icon';

import {NavigationFlowState, StatusLabelState} from '../../types/common/states';

import './StatusLabel.scss';

function getViewState(label?: StatusLabelProps['label']): ViewState {
    const states: Record<Exclude<typeof label, undefined>, ViewState> = {
        // preparing states
        materializing: 'preparing',
        initializing: 'preparing',
        preparing: 'preparing',
        pending: 'preparing',
        starting: 'preparing',

        // running states
        running: 'running',
        completing: 'running',
        failing: 'running',
        aborting: 'running',
        reviving: 'running',
        suspended: 'suspended',

        // final states
        failed: 'failed',
        completed: 'completed',
        aborted: 'aborted',

        // NavigationFlowState
        Unknown: 'unknown',
        Stopped: 'suspended',
        Paused: 'suspended',
        Working: 'running',
        Draining: 'running',
        Pausing: 'running',
        Completed: 'completed',
    };

    return states[label!] ?? 'unknown';
}

type ViewState =
    | 'preparing'
    | 'running'
    | 'failed'
    | 'aborted'
    | 'completed'
    | 'suspended'
    | 'unknown';

function getIcon(state: ViewState) {
    const iconsByViewState: Record<ViewState, IconName> = {
        preparing: 'clock',
        running: 'play-circle',
        suspended: 'pause-circle',
        failed: 'times-circle',
        completed: 'check-circle',
        aborted: 'times-circle',
        unknown: 'question-circle',
    };
    return iconsByViewState[state];
}

const b = block('status-label');

export type StatusLabelProps = {
    className?: string;
    label?: StatusLabelState | NavigationFlowState;
    renderPlaque?: boolean;
};

export default function StatusLabel({className, label, renderPlaque}: StatusLabelProps) {
    const mappedState = getViewState(label);
    const icon = getIcon(mappedState);
    const mods = {state: mappedState};

    return !label ? (
        <span />
    ) : (
        <span className={b(null, renderPlaque ? b('plaque', mods, className) : b(mods, className))}>
            <Icon awesome={icon} />
            <span>{hammer.format['ReadableField'](label)}</span>
        </span>
    );
}
