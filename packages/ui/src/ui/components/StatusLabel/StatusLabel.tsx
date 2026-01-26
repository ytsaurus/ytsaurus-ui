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
        waiting: 'preparing',

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

export type ViewState =
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
    text?: string;
    state?: ViewState;
    iconState?: ViewState;
    hideIcon?: boolean;
};

export default function StatusLabel({
    className,
    label,
    renderPlaque,
    text,
    state,
    iconState,
    hideIcon,
}: StatusLabelProps) {
    const mappedState = getViewState(label);
    const icon = getIcon(iconState ?? mappedState);
    const mods = {state: state ?? mappedState};
    return !label && !(text || state) ? (
        <span />
    ) : (
        <span className={b(null, renderPlaque ? b('plaque', mods, className) : b(mods, className))}>
            {!hideIcon && <Icon awesome={icon} size={13} />}
            <span>{text ?? hammer.format['ReadableField'](label)}</span>
        </span>
    );
}
