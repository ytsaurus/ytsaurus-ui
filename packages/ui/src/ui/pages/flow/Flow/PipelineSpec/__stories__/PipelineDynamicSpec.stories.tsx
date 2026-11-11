import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {FlowDynamicSpec} from '../PipelineSpec';
import {FlowTabs} from '../../Flow';
import {
    PIPELINE_PATH,
    blameSnapshot,
    dynamicSpecHandler,
    largePatchSnapshot,
    legacyHandler,
    markdownHandler,
    snapshot,
    unsupportedHandler,
} from './mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

function PipelineDynamicSpec() {
    return <FlowDynamicSpec pipeline_path={PIPELINE_PATH} />;
}

const meta: Meta<typeof PipelineDynamicSpec> = {
    title: 'Pages/Flow/PipelineDynamicSpec',
    component: PipelineDynamicSpec,
};

export default meta;
type Story = StoryObj<typeof PipelineDynamicSpec>;

export const Patches: Story = {
    parameters: {msw: {handlers: [dynamicSpecHandler(), markdownHandler]}},
};
export const Blame: Story = {
    parameters: {msw: {handlers: [dynamicSpecHandler(blameSnapshot), markdownHandler]}},
};
export const LargePatch: Story = {
    parameters: {
        msw: {handlers: [dynamicSpecHandler(largePatchSnapshot), markdownHandler]},
    },
};
export const Empty: Story = {
    parameters: {
        msw: {handlers: [dynamicSpecHandler({...snapshot, patches: []}), markdownHandler]},
    },
};
export const Unsupported: Story = {
    parameters: {msw: {handlers: [unsupportedHandler, legacyHandler]}},
};

export const NoPatchFeature: Story = {
    parameters: {msw: {handlers: [dynamicSpecHandler(snapshot, []), legacyHandler]}},
};

export const WithTabs: Story = {
    ...Patches,
    decorators: [
        (Story) => (
            <div className="yt-flow">
                <FlowTabs />
                <Story />
            </div>
        ),
    ],
};
