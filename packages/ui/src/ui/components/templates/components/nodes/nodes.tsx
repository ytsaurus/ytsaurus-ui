import React from 'react';

import Label from '../../../../components/Label/Label';

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
