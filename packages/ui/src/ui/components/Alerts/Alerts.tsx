import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';

import React from 'react';
import cn from 'bem-cn-lite';

import CollapsibleSection, {
    CollapsibleSectionProps,
} from '../../components/CollapsibleSection/CollapsibleSection';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import {YTAlertBlock} from '../../components/Alert/Alert';
import {UI_COLLAPSIBLE_SIZE} from '../../constants/global/index';
import {YTError} from '../../types/index';

const block = cn('yt-alerts');

export type AlertsProps = {
    className?: string;
    items?: Array<YTError> | Record<string, YTError>;
    marginDirection?: CollapsibleSectionProps['marginDirection'];
};

export function Alerts({className, items, marginDirection = 'bottom'}: AlertsProps) {
    if (isEmpty_(items)) {
        return null;
    }

    return (
        <ErrorBoundary>
            <div className={block(null, className)}>
                <CollapsibleSection
                    name="Alerts"
                    size={UI_COLLAPSIBLE_SIZE}
                    marginDirection={marginDirection}
                >
                    {map_(items, (alert, index) => {
                        return <YTAlertBlock key={index} error={alert as YTError} />;
                    })}
                </CollapsibleSection>
            </div>
        </ErrorBoundary>
    );
}
