import {type Meta, type StoryObj} from '@storybook/react';

import {AccountDeleteEditor} from '../AccountDeleteEditor';
import {prepareAccountEditorData} from '../prepareAccountEditorData';

function makeAccount(recursiveResourceUsage?: Record<string, unknown>) {
    return prepareAccountEditorData('account', {
        $attributes: {recursive_resource_usage: recursiveResourceUsage},
        $value: {},
    }).accountsByName.account;
}

const meta: Meta<typeof AccountDeleteEditor> = {
    title: 'Pages/Accounts/AccountEditor/Delete',
    component: AccountDeleteEditor,
    args: {
        account: makeAccount(),
        onDeleted: () => undefined,
    },
};

export default meta;
type Story = StoryObj<typeof AccountDeleteEditor>;

export const Empty: Story = {};

export const WithUsage: Story = {
    args: {
        account: makeAccount({
            node_count: 3,
            disk_space_per_medium: {default: 10},
        }),
    },
};
