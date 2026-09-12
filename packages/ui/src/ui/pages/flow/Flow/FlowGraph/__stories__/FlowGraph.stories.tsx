import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {FlowGraph} from '../FlowGraph';
import {FlowMessagesDialogContext} from '../renderers/FlowMessagesDialogContext/FlowMessagesDialogContext';
import {
    backpressuredFlowGraphHandler,
    drainedFlowGraphHandler,
    emptyFlowGraphHandler,
    messagesFlowGraphHandler,
    mixedFlowGraphHandler,
} from './mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

const meta: Meta<typeof FlowGraph> = {
    title: 'Pages/Flow/FlowGraph',
    component: FlowGraph,
    parameters: {layout: 'fullscreen'},
};

export default meta;
type Story = StoryObj<typeof FlowGraph>;

const renderGraph = () => (
    <FlowMessagesDialogContext>
        <div style={{width: 1600, height: 860}}>
            <style>{'.yt-flow-graph__graph {width: 1600px; height: 800px;}'}</style>
            <FlowGraph pipeline_path="//home/test/flow" />
        </div>
    </FlowMessagesDialogContext>
);

export const Drained: Story = {
    render: renderGraph,
    parameters: {msw: {handlers: [drainedFlowGraphHandler]}},
};

export const Backpressured: Story = {
    render: renderGraph,
    parameters: {msw: {handlers: [backpressuredFlowGraphHandler]}},
};

export const DrainedAndBackpressured: Story = {
    render: renderGraph,
    parameters: {msw: {handlers: [mixedFlowGraphHandler]}},
};

export const MessagesOnly: Story = {
    render: renderGraph,
    parameters: {msw: {handlers: [messagesFlowGraphHandler]}},
};

export const WithoutDetails: Story = {
    render: renderGraph,
    parameters: {msw: {handlers: [emptyFlowGraphHandler]}},
};
