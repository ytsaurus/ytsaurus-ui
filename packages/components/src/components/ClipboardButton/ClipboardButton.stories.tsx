import type {Meta, StoryObj} from '@storybook/react';

import {ClipboardButton} from './ClipboardButton';

const meta = {
    title: 'Components/ClipboardButton',
    component: ClipboardButton,
    tags: ['autodocs'],
    args: {
        text: 'Some text',
        view: 'outlined',
    },
    argTypes: {
        view: {
            control: 'select',
            options: ['outlined', 'flat', 'action', 'normal', 'raised', 'clear'],
            description:
                'Button appearance. The `clear` value is mapped to Gravity UI `flat` inside the component.',
        },
    },
} satisfies Meta<typeof ClipboardButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
