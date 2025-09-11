import React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react';

import Label, {LabelTheme} from '../Label';

const meta: Meta<typeof Label> = {
    title: 'Components/Label',
    component: Label,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        theme: {
            control: 'select',
            options: [
                'default',
                'success',
                'warning',
                'danger',
                'info',
                'complementary',
                'misc',
            ] as LabelTheme[],
            description: 'Visual theme of the label',
        },
        type: {
            control: 'select',
            options: ['block', 'text'],
            description: 'Display type - block with background or text-only',
        },
        text: {
            control: 'text',
            description: 'Text content to display',
        },
        capitalize: {
            control: 'boolean',
            description: 'Capitalize the first letter',
        },
        hideTitle: {
            control: 'boolean',
            description: 'Hide the title attribute',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class name',
        },
    },
    decorators: [
        (Story) => (
            <div style={{padding: '20px'}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
    args: {
        theme: 'default',
        text: 'Default Label',
        type: 'block',
    },
};

export const AllThemesShowcase: Story = {
    render: () => (
        <Flex direction={'column'} gap={5}>
            <div>
                <Text variant={'header-1'}>Block Type Labels</Text>
                <Flex gap={2} alignItems={'center'} wrap>
                    <Label theme="default" text="Default" />
                    <Label theme="success" text="Success" />
                    <Label theme="warning" text="Warning" />
                    <Label theme="danger" text="Danger" />
                    <Label theme="info" text="Info" />
                    <Label theme="complementary" text="Complementary" />
                    <Label theme="misc" text="Misc" />
                </Flex>
            </div>
            <div>
                <Text variant={'header-1'}>Text Type Labels</Text>
                <Flex gap={2} alignItems={'center'} wrap>
                    <Label capitalize theme="default" type="text">
                        Children capitalized
                    </Label>
                    <Label capitalize theme="success" text="success" type="text" />
                    <Label capitalize theme="warning" text="warning" type="text" />
                    <Label capitalize theme="danger" text="danger" type="text" />
                    <Label capitalize theme="info" text="info" type="text" />
                </Flex>
            </div>
        </Flex>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Complete showcase of all available label themes in both block and text types.',
            },
        },
    },
};

export const Playground: Story = {
    args: {
        theme: 'default',
        type: 'block',
        text: 'Interactive Label',
        capitalize: false,
        hideTitle: false,
    },
    render: (args) => <Label {...args} />,
};
