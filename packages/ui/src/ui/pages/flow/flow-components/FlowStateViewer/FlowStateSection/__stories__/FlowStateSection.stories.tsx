import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {FlowRoutedStoryHarness} from '../../../__stories__/FlowRoutedStoryHarness';
import {FlowStateSection, type FlowStateSectionProps} from '../FlowStateSection';
import type {FlowStateFiltersValue} from '../../types';
import {createStateReadHandlers} from './mocks';

type StoryProps = FlowStateSectionProps & {initialFilters?: Partial<FlowStateFiltersValue>};

const meta: Meta<StoryProps> = {
    title: 'Pages/Flow/FlowStateSection',
    component: FlowStateSection,
    decorators: [
        (Story, {args}) => (
            <FlowRoutedStoryHarness stateFilters={args.initialFilters}>
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
type Story = StoryObj<StoryProps>;
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
