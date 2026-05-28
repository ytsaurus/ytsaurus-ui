import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {type Meta, type StoryObj} from '@storybook/react';

import {YTErrorBlock} from '../Block';

const meta: Meta<typeof YTErrorBlock> = {
    title: 'Components/Block',
    component: YTErrorBlock,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        type: {
            control: 'select',
            options: ['alert', 'error', 'info'],
            description: 'Visual type of the block',
        },
        message: {
            control: 'text',
            description: 'Message to display inside the block',
        },
        header: {
            control: 'text',
            description: 'Custom header text',
        },
        helpURL: {
            control: 'text',
            description: 'URL for the help link',
        },
        topMargin: {
            control: 'select',
            options: ['none', 'half'],
            description: 'Top margin size',
        },
        bottomMargin: {
            control: 'boolean',
            description: 'Whether to add bottom margin',
        },
        view: {
            control: 'select',
            options: [undefined, 'compact'],
            description: 'Compact view hides error details and shows a button instead',
        },
        disableLogger: {
            control: 'boolean',
            description: 'Disable RUM error logging',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class name',
        },
    },
    decorators: [
        (Story) => (
            <div style={{padding: '20px', minWidth: '500px'}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof YTErrorBlock>;

export const Default: Story = {
    args: {
        type: 'error',
        message: 'Something went wrong while loading the data.',
        disableLogger: true,
    },
};

export const AllVariantsShowcase: Story = {
    render: () => (
        <Flex direction={'column'} gap={5}>
            <div>
                <Text variant={'header-1'}>Error type</Text>
                <YTErrorBlock
                    type="error"
                    message="An error occurred while processing your request."
                    disableLogger
                />
            </div>
            <div>
                <Text variant={'header-1'}>Alert type</Text>
                <YTErrorBlock
                    type="alert"
                    message="This action may have unintended consequences."
                    disableLogger
                />
            </div>
            <div>
                <Text variant={'header-1'}>Info type</Text>
                <YTErrorBlock
                    type="info"
                    message="The operation is currently in progress."
                    disableLogger
                />
            </div>
            <div>
                <Text variant={'header-1'}>With YT error object</Text>
                <YTErrorBlock
                    type="error"
                    error={{code: 500, message: 'Internal server error', inner_errors: []}}
                    disableLogger
                />
            </div>
            <div>
                <Text variant={'header-1'}>With custom header</Text>
                <YTErrorBlock
                    type="error"
                    header="Custom Header"
                    message="This block has a custom header instead of the default one."
                    disableLogger
                />
            </div>
            <div>
                <Text variant={'header-1'}>With help URL</Text>
                <YTErrorBlock
                    type="info"
                    message="Click the help link for more information."
                    helpURL="https://example.com/help"
                    disableLogger
                />
            </div>
            <div>
                <Text variant={'header-1'}>Compact view</Text>
                <YTErrorBlock
                    type="error"
                    view="compact"
                    error={{code: 500, message: 'Internal server error', inner_errors: []}}
                    disableLogger
                />
            </div>
        </Flex>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Complete showcase of all available block types, views, and configurations.',
            },
        },
    },
};

export const Playground: Story = {
    args: {
        type: 'error',
        message: 'Interactive error message.',
        disableLogger: true,
        bottomMargin: false,
    },
    render: (args) => <YTErrorBlock {...args} />,
};

export const WithErrorObject: Story = {
    args: {
        type: 'error',
        error: {
            code: 500,
            message: 'Internal server error',
            inner_errors: [
                {
                    code: 1,
                    message: 'Nested error detail',
                    attributes: {
                        foo: 'bar',
                    },
                    inner_errors: [],
                },
            ],
        },
        disableLogger: true,
    },
};

export const CompactView: Story = {
    args: {
        type: 'error',
        view: 'compact',
        error: {code: 500, message: 'Internal server error', inner_errors: []},
        disableLogger: true,
    },
};
