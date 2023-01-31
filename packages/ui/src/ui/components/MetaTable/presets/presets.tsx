import React from 'react';
import ypath from '../../../common/thor/ypath';
import {LabelOnOff} from '../../Label/Label';

export function replicatedTableTracker(attributes: any) {
    const value = ypath.getValue(
        attributes,
        '/replicated_table_options/replicated_table_tracker_enabled',
    );
    return {
        key: 'replicated_table_tracker',
        value: <LabelOnOff value={value} />,
        visible: value !== undefined,
    };
}
