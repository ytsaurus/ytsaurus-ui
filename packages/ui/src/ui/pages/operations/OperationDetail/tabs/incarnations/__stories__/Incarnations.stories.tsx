import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import Incarnations, {type IncarnationProps, IncarnationsTemplate} from '../Incarnations';
import {IncarnationsWithRequests} from '../__tests__/helpers';
import {
    operationEventsHandler,
    operationEventsHandlerError,
    operationEventsHandlerWithLoading,
} from './mocks';

yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');

export default {
    title: 'Pages/Operations/Incarnations',
    component: IncarnationsTemplate,
    argTypes: {
        incarnations: {
            description: 'Array of incarnation data to display',
            control: false,
        },
        isLoading: {
            control: 'boolean',
            description: 'Loading state indicator',
        },
    },
} as Meta<IncarnationProps>;

type Story = StoryObj<IncarnationProps>;

const BaseComponent = () => <IncarnationsWithRequests component={<Incarnations />} />;

export const Default: Story = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [operationEventsHandler],
        },
    },
};

export const Loading: Story = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [operationEventsHandlerWithLoading],
        },
    },
};

export const Error: Story = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [operationEventsHandlerError],
        },
    },
};

export const Empty: Story = {
    render: BaseComponent,
    parameters: {
        msw: {
            handlers: [operationEventsHandlerError],
        },
    },
};
