import React, {FC} from 'react';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';

export type PlanView = 'graph' | 'table' | 'timeline';

const planViews: {value: PlanView; content: string}[] = [
    {
        value: 'graph',
        content: 'Graph',
    },
    {
        value: 'timeline',
        content: 'Timeline',
    },
];

type Props = {
    value: PlanView;
    onUpdate: (view: PlanView) => void;
};

export const PlanActions: FC<Props> = ({value, onUpdate}) => {
    return <SegmentedRadioGroup options={planViews} value={value} onUpdate={onUpdate} />;
};
