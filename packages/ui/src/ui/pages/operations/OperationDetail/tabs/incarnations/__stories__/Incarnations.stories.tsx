import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';
import {Alert} from '@gravity-ui/uikit';

// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {YTErrorBlock} from '../../../../../../components/Error/Error';

import {IncarnationsCountTemplate} from '../IncarnationsCount';
import Incarnations, {type IncarnationProps, IncarnationsTemplate} from '../Incarnations';
import {IncarnationsToolbarTemplate} from '../IncarnationsToolbar';
import {IncarnationsWithRequests} from '../__tests__/helpers';
import {
    mockIncarnations,
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

const incarnationsCount = <IncarnationsCountTemplate items={[{type: 'All', count: 3}]} />;

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

export const WithTelemetryAndAlert: Story = {
    args: {
        incarnations: mockIncarnations,
        isLoading: false,
        error: undefined,
        renderTelemetryInfo: () => (
            <YTErrorBlock header={'Some Fail'} message={'Operation failed for some reason'} />
        ),
        incarnationsCount,
        incarnationsToolbar: <IncarnationsToolbarTemplate />,
        incarnationsAlert: (
            <Alert title={'You may be forgot to pass some params to enable telemetry'} />
        ),
    },
    render: (args) => <IncarnationsTemplate {...args} />,
};
