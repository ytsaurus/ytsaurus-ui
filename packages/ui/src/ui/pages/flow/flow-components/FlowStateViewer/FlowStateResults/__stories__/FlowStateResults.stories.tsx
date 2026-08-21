import React from 'react';
import {type Meta, type StoryFn, type StoryObj} from '@storybook/react';

import type {FlowReadStatesResponse} from '../../../../../../../shared/yt-types';
import AttributesModal from '../../../../../../containers/AttributesModal/AttributesModal';
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
            <div style={{width: '100%', maxWidth: 1200, minHeight: 320, padding: 20}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof FlowStateResults>;

const baseArgs = {
    hasScope: true,
    initialLoading: false,
    refreshing: false,
    readSucceeded: true,
    handlers,
    rowSelection: {},
    onRowSelectionChange: () => {},
    writeDenied: false,
    onDeleteSelected: () => {},
};

function renderResults(args: React.ComponentProps<typeof FlowStateResults>) {
    return (
        <React.Fragment>
            <FlowStateResults {...args} />
            <AttributesModal />
        </React.Fragment>
    );
}

export const Populated: Story = {
    args: {...baseArgs, response},
    render: renderResults,
};

export const NoScope: Story = {
    args: {...baseArgs, hasScope: false, response: undefined, readSucceeded: false},
    render: renderResults,
};

export const Loading: Story = {
    args: {...baseArgs, response: undefined, initialLoading: true, readSucceeded: false},
    render: renderResults,
};

export const Refreshing: Story = {
    args: {...baseArgs, response, refreshing: true},
    render: renderResults,
};

export const SuccessfulEmpty: Story = {
    args: {...baseArgs, response: {}},
    render: renderResults,
};

export const TransportError: Story = {
    args: {...baseArgs, response: undefined, readSucceeded: false, error: {message: 'Read failed'}},
    render: renderResults,
};

export const ResponseError: Story = {
    args: {
        ...baseArgs,
        response: {...response, errors: ['state //home/flow/pipeline/state is locked']},
    },
    render: renderResults,
};

export const NarrowLongContent: Story = {
    args: {
        ...baseArgs,
        response: {
            key_states: [
                {
                    computation_id: 'long-computation-name-for-checkout-state-processing',
                    key: ['4506162232340681623', 'checkout-with-an-unusually-long-key-value'],
                    states: {
                        '/a/very/long/state/name/that/keeps/the/table-dense': {
                            nested: {description: 'A long value that must remain inspectable'},
                        },
                    },
                },
            ],
        },
    },
    decorators: [
        (StoryComponent: StoryFn) => (
            <div style={{width: 480}}>
                <StoryComponent />
            </div>
        ),
    ],
    render: renderResults,
};
