import type {Meta, StoryObj} from '@storybook/react';

import {type LabelTheme, Label as YtLabel} from './Label';
import {LabelOnOff as YtLabelOnOff} from './LabelOnOff';

const meta = {
    title: 'Components/Label',
    component: YtLabel,
    tags: ['autodocs'],
    args: {
        text: 'Label text',
        theme: 'default',
        type: 'block',
        capitalize: false,
        hideTitle: false,
    },
    argTypes: {
        theme: {
            control: 'select',
            options: [
                'default',
                'success',
                'warning',
                'danger',
                'error',
                'info',
                'complementary',
                'misc',
            ] satisfies LabelTheme[],
        },
        type: {
            control: 'inline-radio',
            options: ['block', 'text'],
        },
        capitalize: {control: 'boolean'},
        hideTitle: {control: 'boolean'},
    },
} satisfies Meta<typeof YtLabel>;

export default meta;

type LabelStory = StoryObj<typeof meta>;

/** Base label; theme, type, text, and other props are in Controls. */
export const Label: LabelStory = {};

type LabelOnOffArgs = {
    state: 'on' | 'off' | 'noValue';
};

/** Toggle On / Off / No value with State (noValue renders `format.NO_VALUE`). */
export const LabelOnOff: StoryObj<LabelOnOffArgs> = {
    name: 'LabelOnOff',
    argTypes: {
        state: {
            control: 'inline-radio',
            options: ['on', 'off', 'noValue'],
        },
    },
    args: {
        state: 'on',
    },
    render: ({state}: LabelOnOffArgs) => {
        let value: boolean | undefined;
        if (state === 'on') {
            value = true;
        } else if (state === 'off') {
            value = false;
        } else {
            value = undefined;
        }
        return <YtLabelOnOff value={value} />;
    },
};
