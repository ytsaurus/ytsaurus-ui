import React from 'react';
import WithStickyToolbar from '../../../../../components/WithStickyToolbar/WithStickyToolbar';
import SchedulingStaticConfiguration from '../../../../../pages/scheduling/PoolStaticConfiguration/SchedulingStaticConfiguration';
import {SchedulingMeta} from './SchedulingMeta';
import {SchedulingTable} from './SchedulingTable/SchedulingTable';
import {SchedulingToolbar} from './SchedulingToolbar';

export function Overview() {
    return (
        <div>
            <SchedulingMeta />
            <SchedulingStaticConfiguration />
            <WithStickyToolbar
                toolbar={<SchedulingToolbar />}
                content={<SchedulingTable />}
                topMargin="none"
            />
        </div>
    );
}
