import React from 'react';

import {FlowDeleteStatesDialog} from '../FlowDeleteStatesDialog';

const row = {
    section: 'key_state' as const,
    computationId: 'checkout-attribution',
    key: ['4506162232340681623', 'checkout'],
    stateName: '/counter',
    value: {events: 7},
};

export function PendingDelete() {
    const permission = React.useMemo(
        () => ({
            data: {action: 'allow' as const},
            refetch: () => ({unwrap: () => new Promise<{action: 'allow'}>(() => {})}),
        }),
        [],
    );

    return (
        <FlowDeleteStatesDialog
            visible
            onClose={() => {}}
            pipeline_path="//pipeline"
            rows={[row]}
            permission={permission}
            onCommitted={() => {}}
        />
    );
}
