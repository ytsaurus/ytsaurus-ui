import React from 'react';

import Label from '../../../../components/Label/Label';
import hammer from '../../../../common/hammer';

export function prepareUsageText(used: number, limit: number, format: keyof typeof hammer.format) {
    const left = hammer.format[format](used);
    const right = hammer.format[format](limit);

    return `${left} / ${right}`;
}

export function renderLabel(flag: boolean): React.ReactNode {
    return (
        <Label
            text={flag ? 'Disabled' : 'Enabled'}
            theme={flag ? 'danger' : 'success'}
            type="text"
        />
    );
}

export const TABLET_SLOTS = {
    none: {
        theme: 'default',
        text: 'N',
    },
    stopped: {
        theme: 'default',
        text: 'S',
    },
    elections: {
        theme: 'warning',
        text: 'E',
    },
    follower_recovery: {
        theme: 'warning',
        text: 'FR',
    },
    leader_recovery: {
        theme: 'warning',
        text: 'LR',
    },
    following: {
        theme: 'info',
        text: 'F',
    },
    leading: {
        theme: 'success',
        text: 'L',
    },
} as const;
