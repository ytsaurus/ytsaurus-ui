import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';
// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {FlowDynamicSpec} from '../PipelineSpec';
import {PIPELINE_PATH, dynamicSpecEditorHandler} from './editor-mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
function PipelineDynamicSpecEditor() {
    return <FlowDynamicSpec pipeline_path={PIPELINE_PATH} />;
}
const meta: Meta<typeof PipelineDynamicSpecEditor> = {
    title: 'Pages/Flow/PipelineDynamicSpecEditor',
    component: PipelineDynamicSpecEditor,
};
export default meta;
type Story = StoryObj<typeof PipelineDynamicSpecEditor>;
export const Effective: Story = {parameters: {msw: {handlers: [dynamicSpecEditorHandler()]}}};
