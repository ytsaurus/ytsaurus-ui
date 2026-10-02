import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {FlowRoutedStoryHarness} from '../../../FlowRoutedStoryHarness';
import {FlowStateSection} from '../FlowStateSection';
import {createStateReadHandlers} from './mocks';

const meta: Meta<typeof FlowStateSection> = {
    title: 'Pages/Flow/FlowStateSection',
    component: FlowStateSection,
    decorators: [
        (Story) => (
            <FlowRoutedStoryHarness>
                <div style={{width: 1400}}>
                    <Story />
                </div>
            </FlowRoutedStoryHarness>
        ),
    ],
    args: {pipeline_path: '//pipeline', initialFilters: {target: 'key_state'}},
    parameters: {msw: {handlers: createStateReadHandlers()}},
};
export default meta;
type Story = StoryObj<typeof FlowStateSection>;
export const Default: Story = {};

export const ActiveComputations: Story = {
    render: (args) => (
        <React.Fragment>
            <section aria-label="Checkout states">
                <FlowStateSection {...args} fixedComputationId="checkout" />
            </section>
            <section aria-label="Archive states">
                <FlowStateSection {...args} fixedComputationId="archive" />
            </section>
        </React.Fragment>
    ),
};
