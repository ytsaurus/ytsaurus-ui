import React from 'react';
import block from 'bem-cn-lite';

import SystemCounters, {SystemCountersProps} from '../SystemCounters/SystemCounters';
import {Progress, ProgressProps} from '@gravity-ui/uikit';

import {computeEffectiveStateProgress} from '../../../utils';

import './SystemStateOverview.scss';
import {SystemStateLabels, Props as SystemStateLabelsProps} from './SystemStateLabels';

const b = block('system');

export type SystemStateOverviewProps<Flags extends string> = Partial<SystemStateLabelsProps> &
    SystemCountersProps<Flags> & {
        stateOverview?: ProgressProps;
    };

export default class SystemStateOverview<Flags extends string> extends React.Component<
    SystemStateOverviewProps<Flags>
> {
    render() {
        const {stateOverview: _x, labels, ...rest} = this.props;
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
                {labels && <SystemStateLabels labels={labels} />}
                <SystemCounters {...rest} />
                <div className={b('heading-overview-states')}>
                    <Progress {...stateOverview} />
                </div>
            </div>
        );
    }
}
