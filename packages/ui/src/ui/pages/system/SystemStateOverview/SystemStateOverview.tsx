import block from 'bem-cn-lite';
import React from 'react';

import {Progress, ProgressProps} from '@gravity-ui/uikit';
import SystemCounters, {SystemCountersProps} from '../SystemCounters/SystemCounters';

import {computeEffectiveStateProgress} from '../../../utils/index';

import './SystemStateOverview.scss';

const b = block('system');

export type SystemStateOverviewProps<Flags extends string> = SystemCountersProps<Flags> & {
    stateOverview?: ProgressProps;
};

export default class SystemStateOverview<Flags extends string> extends React.Component<
    SystemStateOverviewProps<Flags>
> {
    render() {
        const {stateOverview: _x, ...rest} = this.props;
        if (!this.props.counters) {
            return null;
        }

        const {
            stateOverview = {
                value: 100,
                view: 'thin',
                stack: computeEffectiveStateProgress(this.props.counters),
            },
        } = this.props;

        return (
            <div className={b('heading-overview')}>
                <SystemCounters {...rest} />
                <div className={b('heading-overview-states')}>
                    <Progress {...stateOverview} size="s" />
                </div>
            </div>
        );
    }
}
