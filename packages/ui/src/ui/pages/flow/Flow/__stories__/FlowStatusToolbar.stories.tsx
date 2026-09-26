import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {filtersSlice} from '../../../../store/reducers/flow/filters';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import {FlowStatusToolbar} from '../Flow';
import {PIPELINE_PATH, makeFlowStatusHandlers} from './mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

function FlowStatusToolbarWithPath() {
    const dispatch = useDispatch();
    const pipelinePath = useSelector(selectFlowPipelinePath);

    React.useEffect(() => {
        dispatch(filtersSlice.actions.updateFlowFilters({pipelinePath: PIPELINE_PATH}));
    }, [dispatch]);

    return pipelinePath ? <FlowStatusToolbar /> : null;
}

const meta: Meta<typeof FlowStatusToolbarWithPath> = {
    title: 'Pages/Flow/FlowStatusToolbar',
    component: FlowStatusToolbarWithPath,
};

export default meta;
type Story = StoryObj<typeof FlowStatusToolbarWithPath>;

export const Working: Story = {
    parameters: {msw: {handlers: makeFlowStatusHandlers('Working')}},
};

export const Draining: Story = {
    parameters: {msw: {handlers: makeFlowStatusHandlers('Draining')}},
};

export const Pausing: Story = {
    parameters: {msw: {handlers: makeFlowStatusHandlers('Pausing')}},
};

export const Stopped: Story = {
    parameters: {msw: {handlers: makeFlowStatusHandlers('Stopped')}},
};
