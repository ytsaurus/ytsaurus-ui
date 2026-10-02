import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';

import {FlowDeleteStatesDialog, type FlowDeleteStatesDialogProps} from '../FlowDeleteStatesDialog';
import {createDeleteWorkflowHandlers} from './workflow-mocks';

const rows = [
    {
        section: 'key_state' as const,
        computationId: 'checkout',
        key: [{$type: 'uint64', $value: '7'}, 'ключ'],
        stateName: '/first',
        value: {events: 7},
    },
    {
        section: 'key_state' as const,
        computationId: 'checkout',
        key: [{$type: 'uint64', $value: '8'}, 'ключ'],
        stateName: '/second',
        value: {events: 8},
    },
];
const permission = {
    data: {action: 'allow' as const},
    refetch: () => ({unwrap: async () => ({action: 'allow' as const})}),
};

function DeleteWorkflow({onCommitted}: Pick<FlowDeleteStatesDialogProps, 'onCommitted'>) {
    const [visible, setVisible] = React.useState(true);
    const [committed, setCommitted] = React.useState(0);
    return (
        <React.Fragment>
            <div role="status">Deleted rows: {committed}</div>
            <FlowDeleteStatesDialog
                visible={visible}
                onClose={() => setVisible(false)}
                pipeline_path="//pipeline"
                rows={rows}
                permission={permission}
                onCommitted={(outcomes, allCommitted) => {
                    setCommitted(
                        (count) =>
                            count + outcomes.filter(({response}) => response?.committed).length,
                    );
                    onCommitted(outcomes, allCommitted);
                }}
            />
        </React.Fragment>
    );
}

const meta: Meta<typeof DeleteWorkflow> = {
    title: 'Pages/Flow/FlowDeleteStatesWorkflow',
    component: DeleteWorkflow,
    args: {onCommitted: () => {}},
};
export default meta;
type Story = StoryObj<typeof DeleteWorkflow>;
export const Success: Story = {parameters: {msw: {handlers: createDeleteWorkflowHandlers()}}};
export const PartialFailure: Story = {
    parameters: {msw: {handlers: createDeleteWorkflowHandlers({failSecond: true})}},
};
