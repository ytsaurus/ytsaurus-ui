import React, {Component} from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import SystemCounters from '../SystemCounters/SystemCounters';
import {Progress, Select} from '@gravity-ui/uikit';

import {computeEffectiveStateProgress} from '../../../utils/index';

import './SystemStateOverview.scss';
import {NODE_TYPE_ITEMS} from '../../../constants/components/nodes/nodes';

const b = block('system');

export default class SystemStateOverview extends Component {
    static propTypes = {
        tab: PropTypes.string.isRequired,
        counters: PropTypes.object,
        stateOverview: PropTypes.object,
    };

    render() {
        const {counters, ...rest} = this.props;
        if (!counters) {
            return null;
        }

        const {
            stateOverview = {
                value: 100,
                view: 'thin',
                stack: computeEffectiveStateProgress(counters),
            },
        } = this.props;

        return (
            <div className={b('heading-overview')}>
                <Select item={NODE_TYPE_ITEMS} />
                <SystemCounters counters={counters} {...rest} />
                <div className={b('heading-overview-states')}>
                    <Progress {...stateOverview} />
                </div>
            </div>
        );
    }
}
