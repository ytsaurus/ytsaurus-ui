import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {FlowDynamicSpec, FlowStaticSpec} from '../PipelineSpec';
import {
    PIPELINE_PATH,
    dynamicSpecHandler,
    failedDynamicSpecHandler,
    legacyDynamicSpecHandler,
    unavailableDynamicSpecHandler,
} from './mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

const meta: Meta<typeof FlowDynamicSpec> = {
    title: 'Pages/Flow/PipelineDynamicSpec',
    component: FlowDynamicSpec,
    args: {pipeline_path: PIPELINE_PATH},
};

export default meta;
type Story = StoryObj<typeof FlowDynamicSpec>;

export const Overrides: Story = {
    render: (args) => (
        <div style={{width: 1400}}>
            <FlowDynamicSpec {...args} />
        </div>
    ),
    parameters: {msw: {handlers: [dynamicSpecHandler]}},
};

export const UnsupportedController: Story = {
    ...Overrides,
    parameters: {msw: {handlers: [unavailableDynamicSpecHandler, legacyDynamicSpecHandler]}},
};

export const RequestError: Story = {
    ...Overrides,
    parameters: {msw: {handlers: [failedDynamicSpecHandler]}},
};

export const StaticSpecification: Story = {
    render: (args) => <FlowStaticSpec {...args} />,
};
