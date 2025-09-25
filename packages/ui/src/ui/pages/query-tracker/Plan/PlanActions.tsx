import React from 'react';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {PlanView, usePlanView, usePlanViews, useSetPlanView} from './PlanContext';

export default function PlanActions() {
    const currentView = usePlanView();
    const planViews = usePlanViews();
    const setPlanView = useSetPlanView();

    return (
        <SegmentedRadioGroup
            options={planViews}
            value={currentView}
            onUpdate={(value) => {
                setPlanView(value as PlanView);
            }}
        />
    );
}
