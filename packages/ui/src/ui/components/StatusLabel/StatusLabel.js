import React, {Component} from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import hammer from '../../common/hammer';
import Icon from '../Icon/Icon';

import './StatusLabel.scss';

const mapOperationLabelToState = (label) => {
    const preparingStates = {
        materializing: 'preparing',
        initializing: 'preparing',
        preparing: 'preparing',
        pending: 'preparing',
        starting: 'preparing',
    };

    const runningStates = {
        running: 'running',
        completing: 'running',
        failing: 'running',
        aborting: 'running',
        reviving: 'running',
        suspended: 'suspended',
    };

    const finalStates = {
        failed: 'failed',
        completed: 'completed',
        aborted: 'aborted',
    };

    const allStates = Object.assign({}, preparingStates, runningStates, finalStates);

    return allStates[label] || 'unknown';
};

const mapOperationStateToIcon = (state) => {
    return {
        preparing: 'clock',
        running: 'play-circle',
        suspended: 'pause-circle',
        failed: 'times-circle',
        completed: 'check-circle',
        aborted: 'times-circle',
        unknown: 'question-circle',
    }[state];
};

const b = block('status-label');

export default class StatusLabel extends Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        renderPlaque: PropTypes.bool,
        state: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
        icon: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    };
    static defaultProps = {
        renderPlaque: false,
        state: mapOperationLabelToState,
        icon: mapOperationStateToIcon,
    };

    getMappedState(label) {
        const {state} = this.props;
        return typeof state === 'function' ? state(label) : state;
    }

    getMappedIcon(state) {
        const {icon} = this.props;
        return typeof icon === 'function' ? icon(state) : icon;
    }

    render() {
        const {label, renderPlaque} = this.props;
        const mappedState = this.getMappedState(label);
        const icon = this.getMappedIcon(mappedState);
        const mods = {state: mappedState};
        const className = b(false, renderPlaque ? b('plaque', mods) : b(mods));

        return (
            <span className={className}>
                <Icon awesome={icon} />
                <span>{hammer.format['ReadableField'](label)}</span>
            </span>
        );
    }
}
