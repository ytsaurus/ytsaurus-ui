import React from 'react';
import {type Meta, type StoryFn, type StoryObj} from '@storybook/react';

import type {FlowReadStatesResponse} from '../../../../../../../shared/yt-types';
import type {FlowStateCellHandlers} from '../../types';
import {FlowStateResults} from '../FlowStateResults';

const response: FlowReadStatesResponse = {
    key_states: [
        {
            computation_id: 'state',
            key: ['4506162232340681623', 'checkout'],
            states: {'/counter': 42},
        },
    ],
    partition_states: [
        {
            computation_id: 'state',
            partition_id: '451c1f9-678607be-3b545a99-97dc719a',
            states: {'/window': {events: 7, closed: false}},
        },
    ],
};

const handlers: FlowStateCellHandlers = {
    getRowFilterUpdate: () => undefined,
    isRowFilterActive: (_row, field) => field === 'target',
    onFiltersChange: () => {},
    resolveStoragePath: () => ({path: '//home/flow/pipeline/state', cluster: 'hahn'}),
    resolveComputationLink: (computationId) => `/hahn/flows/computations/${computationId}/state`,
};

const meta: Meta<typeof FlowStateResults> = {
    title: 'Pages/Flow/FlowStateResults',
    component: FlowStateResults,
    decorators: [
        (Story: StoryFn) => (
            <div style={{width: 1200, height: 320, padding: 20}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof FlowStateResults>;

const baseArgs = {
    appliedLimit: 10,
    loading: false,
    handlers,
    rowSelection: {},
    onRowSelectionChange: () => {},
    writeDenied: false,
    onDeleteSelected: () => {},
};

export const Default: Story = {
    args: {...baseArgs, response},
    render: (args) => <FlowStateResults {...args} />,
};

export const NoResults: Story = {
    args: {...baseArgs, response: undefined},
    render: (args) => <FlowStateResults {...args} />,
};

export const WithResponseErrors: Story = {
    args: {
        ...baseArgs,
        response: {...response, errors: ['state //home/flow/pipeline/state is locked']},
    },
    render: (args) => <FlowStateResults {...args} />,
};
