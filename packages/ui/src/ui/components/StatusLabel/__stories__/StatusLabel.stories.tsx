import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';
import {Flex, Text} from '@gravity-ui/uikit';

import StatusLabel, {type StatusLabelProps, type ViewState} from '../StatusLabel';
import {NavigationFlowState, StatusLabelState} from '../../../types/common/states';

export default {
    title: 'Components/StatusLabel',
    component: StatusLabel,
    parameters: {
        a11y: {
            element: '#storybook-root',
            config: {
                rules: [
                    {
                        id: 'color-contrast',
                        enabled: false,
                    },
                ],
            },
        },
    },
    argTypes: {
        label: {
            control: 'select',
            options: [
                // StatusLabelState options
                'aborted',
                'aborting',
                'completed',
                'completing',
                'failed',
                'failing',
                'initializing',
                'materializing',
                'pending',
                'preparing',
                'reviving',
                'running',
                'starting',
                'suspended',
                // NavigationFlowState options
                'Unknown',
                'Stopped',
                'Paused',
                'Working',
                'Draining',
                'Pausing',
                'Completed',
            ],
            description: 'Status label state that determines the appearance and icon',
        },
        text: {
            control: 'text',
            description: 'Custom text to display instead of the formatted label',
        },
        state: {
            control: 'select',
            options: [
                'preparing',
                'running',
                'failed',
                'aborted',
                'completed',
                'suspended',
                'unknown',
            ],
            description: 'Override the visual state derived from label',
        },
        iconState: {
            control: 'select',
            options: [
                'preparing',
                'running',
                'failed',
                'aborted',
                'completed',
                'suspended',
                'unknown',
            ],
            description: 'Override the icon state independently from the visual state',
        },
        renderPlaque: {
            control: 'boolean',
            description: 'Render as a plaque with background styling',
        },
        showIcon: {
            control: 'boolean',
            description: 'Whether to show the status icon',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class name',
        },
    },
} as Meta<StatusLabelProps>;

type Story = StoryObj<StatusLabelProps>;

export const Default: Story = {
    args: {
        label: 'running',
        showIcon: true,
        renderPlaque: false,
    },
    render: (args) => <StatusLabel {...args} />,
};

export const AllStatusLabelStates: Story = {
    render: () => (
        <Flex direction="column" gap="2">
            <Text variant="subheader-1">StatusLabelState variants:</Text>
            {(
                [
                    'aborted',
                    'aborting',
                    'completed',
                    'completing',
                    'failed',
                    'failing',
                    'initializing',
                    'materializing',
                    'pending',
                    'preparing',
                    'reviving',
                    'running',
                    'starting',
                    'suspended',
                ] as StatusLabelState[]
            ).map((state) => (
                <Flex key={state} alignItems="center" gap="4">
                    <StatusLabel label={state} />
                    <Text color="secondary" style={{minWidth: '120px'}}>
                        {state}
                    </Text>
                </Flex>
            ))}
        </Flex>
    ),
};

export const AllNavigationFlowStates: Story = {
    render: () => (
        <Flex direction="column" gap="2">
            <Text variant="subheader-1">NavigationFlowState variants:</Text>
            {(
                [
                    'Unknown',
                    'Stopped',
                    'Paused',
                    'Working',
                    'Draining',
                    'Pausing',
                    'Completed',
                ] as NavigationFlowState[]
            ).map((state) => (
                <Flex key={state} alignItems="center" gap="4">
                    <StatusLabel label={state} />
                    <Text color="secondary" style={{minWidth: '120px'}}>
                        {state}
                    </Text>
                </Flex>
            ))}
        </Flex>
    ),
};

export const WithPlaque: Story = {
    args: {
        label: 'suspended',
        renderPlaque: true,
        showIcon: true,
    },
    render: (args) => (
        <Flex direction="column" gap="3">
            <h3>Plaque variants:</h3>
            {(
                [
                    'preparing',
                    'running',
                    'failed',
                    'aborted',
                    'completed',
                    'suspended',
                    'unknown',
                ] as ViewState[]
            ).map((state) => (
                <Flex key={state} alignItems="center" gap="4">
                    <StatusLabel {...args} state={state} text={state} />
                    <span style={{fontSize: '14px', color: '#666'}}>{state}</span>
                </Flex>
            ))}
        </Flex>
    ),
};

export const WithCustomText: Story = {
    args: {
        label: 'running',
        text: 'Custom Status Text',
        showIcon: true,
        renderPlaque: false,
    },
    render: (args) => <StatusLabel {...args} />,
};

export const WithoutIcon: Story = {
    args: {
        label: 'completed',
        showIcon: false,
        renderPlaque: false,
    },
    render: (args) => <StatusLabel {...args} />,
};

export const IconStateOverride: Story = {
    render: () => (
        <Flex direction="column" gap="3">
            <Flex alignItems="center" gap="4">
                <StatusLabel label="running" iconState="completed" />
                <Text color="secondary">Running with completed icon</Text>
            </Flex>
            <Flex alignItems="center" gap="4">
                <StatusLabel label="completed" iconState="failed" />
                <Text color="secondary">Completed with failed icon</Text>
            </Flex>
            <Flex alignItems="center" gap="4">
                <StatusLabel label="pending" iconState="aborted" />
                <Text color="secondary">Pending with aborted icon</Text>
            </Flex>
        </Flex>
    ),
};

export const StateOverride: Story = {
    render: () => (
        <Flex direction="column" gap="3">
            <Text variant="subheader-1">Visual state override examples:</Text>
            <Flex alignItems="center" gap="4">
                <StatusLabel label="running" state="failed" />
                <Text color="secondary">Running label with failed styling</Text>
            </Flex>
            <Flex alignItems="center" gap="4">
                <StatusLabel label="failed" state="completed" />
                <Text color="secondary">Failed label with completed styling</Text>
            </Flex>
            <Flex alignItems="center" gap="4">
                <StatusLabel label="pending" state="running" />
                <Text color="secondary">Pending label with running styling</Text>
            </Flex>
        </Flex>
    ),
};

export const Playground: Story = {
    args: {
        label: undefined,
        text: undefined,
        renderPlaque: false,
        showIcon: true,
        state: undefined,
        iconState: undefined,
        className: '',
    },
    render: (args) => (
        <Flex style={{padding: '20px', border: '1px dashed #ccc', borderRadius: '8px'}}>
            <StatusLabel {...args} />
        </Flex>
    ),
};
