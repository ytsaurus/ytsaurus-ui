import React from 'react';

import WarningIcon from '../../../../../components/WarningIcon/WarningIcon';

export function StaleJobIcon({className}: {className?: string}) {
    return (
        <WarningIcon
            className={className}
            hoverContent={'The job is stale, the information may be obsolete'}
        />
    );
}
