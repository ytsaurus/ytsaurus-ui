import React from 'react';

import {SchedulingMeta} from './SchedulingMeta';
import {SchedulingToolbar} from './SchedulingToolbar';
import {SchedulingTable} from './SchedulinTable';

export function Overview() {
    return (
        <div>
            <SchedulingMeta />
            <SchedulingToolbar />
            <SchedulingTable />
        </div>
    );
}
