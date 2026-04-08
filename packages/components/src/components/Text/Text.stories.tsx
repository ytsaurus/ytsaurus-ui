import type {Meta, StoryObj} from '@storybook/react';

import {YTText} from './Text';
import type {TextProps} from './Text';

const meta = {
    title: 'Components/Text',
    component: YTText,
    tags: ['autodocs'],
    args: {
        children: 'YTsaurus UI text',
        color: undefined,
        bold: false,
        noWrap: false,
        ellipsis: false,
        disabled: false,
        capitalize: false,
    },
    argTypes: {
        children: {control: 'text'},
        color: {
            control: 'select',
            options: [
                undefined,
                'primary',
                'secondary',
                'success',
                'info',
                'warning',
                'warning-light',
                'danger',
            ] satisfies Array<TextProps['color'] | undefined>,
        },
        bold: {control: 'boolean'},
        noWrap: {control: 'boolean'},
        ellipsis: {control: 'boolean'},
        disabled: {control: 'boolean'},
        capitalize: {control: 'boolean'},
    },
} satisfies Meta<typeof YTText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const YTTextStory: Story = {
    name: 'YTText',
};
