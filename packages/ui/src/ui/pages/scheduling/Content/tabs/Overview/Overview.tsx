import React from 'react';

import WithStickyToolbar from '../../../../../components/WithStickyToolbar/WithStickyToolbar';

import {SchedulingMeta} from './SchedulingMeta';
import {SchedulingToolbar} from './SchedulingToolbar';
import {SchedulingTable} from './SchedulingTable/SchedulingTable';

export function Overview() {
    return (
        <div>
            <SchedulingMeta />
            <WithStickyToolbar
                toolbar={<SchedulingToolbar />}
                content={<SchedulingTable />}
                topMargin="none"
            />
        </div>
    );
}
