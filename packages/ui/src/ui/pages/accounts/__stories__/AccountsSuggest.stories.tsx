import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

import {type YTError} from '../../../../@types/types';
import {AccountsSuggestView} from '../AccountsSuggest';

const meta: Meta<typeof AccountsSuggestView> = {
    title: 'Pages/Accounts/AccountsSuggest',
    component: AccountsSuggestView,
    args: {
        items: ['parent', 'another-account'],
        onChange: () => undefined,
        value: 'parent',
    },
    decorators: [
        (Story) => (
            <div style={{width: 360}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof AccountsSuggestView>;

export const Loading: Story = {
    args: {items: [], loading: true},
};

export const Error: Story = {
    args: {
        error: {message: 'Failed to load accounts'} as YTError,
        items: [],
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
        excludedAccounts: ['parent'],
        items: ['another-account'],
    },
};
