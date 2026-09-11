import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {FlowStateKeyBuilder} from '../FlowStateKeyBuilder';
import {FlowStateKeyDialog} from '../FlowStateKeyDialog';

const meta: Meta<typeof FlowStateKeyBuilder> = {
    title: 'Pages/Flow/FlowStateKey',
    component: FlowStateKeyBuilder,
    args: {
        columns: [{name: 'account', type: 'string'}],
        values: {account: 'alice'},
        onChange: () => {},
    },
};
export default meta;
type Story = StoryObj<typeof FlowStateKeyBuilder>;
export const Narrow: Story = {};
export const Fields: Story = {
    args: {
        columns: [
            {name: 'account', type: 'string'},
            {name: 'region', type: 'int64'},
        ],
        values: {account: 'alice', region: '42'},
    },
    render: ({columns, values, onChange}) => (
        <FlowStateKeyDialog
            visible
            columns={columns}
            values={values}
            onApply={onChange}
            onClose={() => {}}
        />
    ),
};
