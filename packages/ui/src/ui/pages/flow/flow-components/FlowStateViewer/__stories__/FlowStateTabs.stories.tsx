import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Route} from 'react-router';
import {useSelector} from 'react-redux';

import {FlowRoutedLocationProbe, FlowRoutedStoryHarness} from '../../FlowRoutedStoryHarness';
import {selectFlowPipelinePath} from '../../../../../store/selectors/flow/filters';
import {FlowComputationStateTab} from '../FlowComputationStateTab';
import {FlowPipelineStateTab} from '../FlowPipelineStateTab';
import {createStateReadHandlers} from '../FlowStateSection/__stories__/mocks';

type FlowStateTabStoryArgs = {initialUrl: string};

const meta: Meta<FlowStateTabStoryArgs> = {
    title: 'Pages/Flow/FlowStateTabs',
    parameters: {msw: {handlers: createStateReadHandlers()}},
};
export default meta;
type Story = StoryObj<FlowStateTabStoryArgs>;

function renderRouted(initialUrl: string, route: React.ReactNode) {
    return (
        <FlowRoutedStoryHarness urlSync initialEntries={[initialUrl]}>
            <div style={{width: 1400}}>
                {route}
                <FlowRoutedLocationProbe />
            </div>
        </FlowRoutedStoryHarness>
    );
}

function RoutedPipelineStateTab() {
    const pipeline_path = useSelector(selectFlowPipelinePath);
    return <FlowPipelineStateTab pipeline_path={pipeline_path} />;
}

function RoutedComputationStateTab() {
    const path = useSelector(selectFlowPipelinePath);
    return <FlowComputationStateTab path={path} computation="checkout" />;
}

export const PipelineTab: Story = {
    args: {initialUrl: '/hahn/flows/state?path=//pipeline'},
    render: ({initialUrl}) =>
        renderRouted(
            initialUrl,
            <Route path="/:cluster/flows/state" render={() => <RoutedPipelineStateTab />} />,
        ),
};

export const ComputationTab: Story = {
    args: {initialUrl: '/hahn/flows/computations/checkout/state?path=//pipeline'},
    render: ({initialUrl}) =>
        renderRouted(
            initialUrl,
            <Route
                path="/:cluster/flows/computations/:computation/state"
                render={() => <RoutedComputationStateTab />}
            />,
        ),
};

export const StateRoutes: Story = {
    args: {initialUrl: '/hahn/flows/state?path=//pipeline'},
    render: ({initialUrl}) =>
        renderRouted(
            initialUrl,
            <React.Fragment>
                <Route path="/:cluster/flows/state" render={() => <RoutedPipelineStateTab />} />
                <Route
                    path="/:cluster/flows/computations/:computation/state"
                    render={() => <RoutedComputationStateTab />}
                />
            </React.Fragment>,
        ),
};
