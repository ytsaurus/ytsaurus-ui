import React from 'react';
import {RadioButton} from '@gravity-ui/uikit';

import {PlanView, usePlanView, usePlanViews, useSetPlanView} from './PlanContext';

export default function PlanActions() {
    const currentView = usePlanView();
    const planViews = usePlanViews();
    const setPlanView = useSetPlanView();

    return (
        <RadioButton
            options={planViews}
            value={currentView}
            onUpdate={(value) => {
                setPlanView(value as PlanView);
            }}
        />
    );
}
