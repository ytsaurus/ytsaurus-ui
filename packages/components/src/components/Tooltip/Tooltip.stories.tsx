import type {Meta, StoryObj} from '@storybook/react';

import {Tooltip} from './Tooltip';

const meta = {
    title: 'Components/Tooltip',
    component: Tooltip,
    tags: ['autodocs'],
    args: {
        content: 'Simple text',
        children: 'Hover me',
        placement: 'right',
        openDelay: 400,
        closeDelay: 400,
        disabled: false,
        useFlex: false,
        ellipsis: false,
    },
    argTypes: {
        content: {control: 'text'},
        children: {control: 'text'},
        placement: {
            control: 'inline-radio',
            options: ['top', 'bottom', 'left', 'right'],
        },
        openDelay: {control: 'number'},
        closeDelay: {control: 'number'},
        disabled: {control: 'boolean'},
        useFlex: {control: 'boolean'},
        ellipsis: {control: 'boolean'},
    },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
