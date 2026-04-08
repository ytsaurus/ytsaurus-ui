import type {Meta, StoryObj} from '@storybook/react';

import {NoContent} from './NoContent';

const meta = {
    title: 'Components/NoContent',
    component: NoContent,
    tags: ['autodocs'],
    args: {
        warning: 'Nothing here',
        hint: 'Try changing filters or pick another path.',
        padding: 'regular',
        imageSize: 140,
        vertical: false,
    },
    argTypes: {
        padding: {
            control: 'inline-radio',
            options: ['regular', 'large'],
        },
        imageSize: {
            control: {type: 'number', min: 40, max: 240, step: 10},
        },
        vertical: {control: 'boolean'},
        warning: {control: 'text'},
        hint: {control: 'text'},
    },
    parameters: {
        layout: 'centered',
    },
} satisfies Meta<typeof NoContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
