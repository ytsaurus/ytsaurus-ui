import * as React from 'react';

// import {useUserSettings} from 'context/user-settings';
import type {Plan, Progress} from './models/plan';

export type PlanView = 'graph' | 'table' | 'timeline';
type PlanViewValues = {value: PlanView; content: React.ReactNode}[];

const PlanContext = React.createContext<Plan | undefined | null>(undefined);
const PlanViewValueContext = React.createContext<PlanView | undefined>(undefined);
const PlanViewValuesContext = React.createContext<PlanViewValues | undefined>(undefined);
const PlanViewSetContext = React.createContext<
    React.Dispatch<React.SetStateAction<PlanView>> | undefined
>(undefined);
const ProgressContext = React.createContext<Progress | undefined | null>(undefined);

interface PlanProviderProps {
    plan?: Plan;
    progress?: Progress;
    children: React.ReactNode;
    defaultView?: PlanView;
}

const commonPlanViews: PlanViewValues = [
    {
        value: 'graph',
        content: 'Graph',
    },
    {
        value: 'timeline',
        content: 'Timeline',
    },
];

const tablePlanView: PlanViewValues = [
    {
        value: 'table',
        content: 'Table',
    },
];

export function PlanProvider({plan, progress, children, defaultView}: PlanProviderProps) {
    const experimentShowProgressTable = false; // useUserSettings();

    const availableViews = React.useMemo(() => {
        if (experimentShowProgressTable) {
            return [...commonPlanViews, ...tablePlanView];
        }
        return commonPlanViews;
    }, [experimentShowProgressTable]);

    const firstPlanView = availableViews[0].value;

    const [planView, setPlanView] = React.useState<PlanView>(defaultView ?? firstPlanView);

    let activeView = planView;

    if (!availableViews.find((v) => v.value === activeView)) {
        activeView = firstPlanView;
    }

    return (
        <PlanContext.Provider value={plan ?? null}>
            <PlanViewValuesContext.Provider value={availableViews}>
                <PlanViewValueContext.Provider value={activeView}>
                    <PlanViewSetContext.Provider value={setPlanView}>
                        <ProgressContext.Provider value={progress ?? null}>
                            {children}
                        </ProgressContext.Provider>
                    </PlanViewSetContext.Provider>
                </PlanViewValueContext.Provider>
            </PlanViewValuesContext.Provider>
        </PlanContext.Provider>
    );
}

export function useResultPlan() {
    const plan = React.useContext(PlanContext);
    if (plan === undefined) {
        throw new Error('useResultPlan must be used within a PlanProvider');
    }
    return plan;
}

export function useResultProgress() {
    const progress = React.useContext(ProgressContext);
    if (progress === undefined) {
        throw new Error('useResultProgress must be used within a PlanProvider');
    }
    return progress;
}

export function usePlanView() {
    const planView = React.useContext(PlanViewValueContext);
    if (planView === undefined) {
        throw new Error('usePlanView must be used within a PlanProvider');
    }
    return planView;
}

export function usePlanViews() {
    const planViewAvailableValues = React.useContext(PlanViewValuesContext);
    if (planViewAvailableValues === undefined) {
        throw new Error('usePlanView must be used within a PlanProvider');
    }
    return planViewAvailableValues;
}

export function useSetPlanView() {
    const setPlanView = React.useContext(PlanViewSetContext);
    if (setPlanView === undefined) {
        throw new Error('useSetPlanView must be used within a PlanProvider');
    }
    return setPlanView;
}
