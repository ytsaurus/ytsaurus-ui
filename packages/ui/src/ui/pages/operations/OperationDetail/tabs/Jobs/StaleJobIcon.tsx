import React from 'react';

import WarningIcon from '../../../../../components/WarningIcon/WarningIcon';
import i18n from './i18n';

export function StaleJobIcon({className}: {className?: string}) {
    return <WarningIcon className={className} hoverContent={i18n('context_stale-job')} />;
}
