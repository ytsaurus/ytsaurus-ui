import type {Meta, StoryObj} from '@storybook/react';

import {FormatNumber} from '../FormatNumber';

const meta: Meta<typeof FormatNumber> = {
    title: 'Components/FormatNumber',
    component: FormatNumber,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof FormatNumber>;

export const Number: Story = {
    args: {
        value: 1.23456789,
        type: 'Number',
        settings: {digits: 4},
    },
};

export const NumberWithoutTooltip: Story = {
    args: {
        value: 1.2345,
        type: 'Number',
        settings: {digits: 4},
    },
};

export const NumberWithTooltip: Story = {
    args: {
        value: 1.2345,
        type: 'Number',
        settings: {digits: 4},
        tooltip: 'Explicitly defined',
    },
};

export const NumberSmart: Story = {
    args: {
        value: 1.23456789,
        type: 'NumberSmart',
        settings: {significantDigits: 4},
        tooltip: 'Auto calculated',
    },
};

export const Bytes: Story = {
    args: {
        value: 123456789,
        type: 'Bytes',
    },
};

export const Bytes100Kb: Story = {
    args: {
        value: 102400,
        type: 'Bytes',
    },
};
