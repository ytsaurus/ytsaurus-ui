import {type Meta, type StoryObj} from '@storybook/react';

import {DeletedAccountMessage} from '../AccountEditor';

const meta: Meta<typeof DeletedAccountMessage> = {
    title: 'Pages/Accounts/AccountEditor/Deleted',
    component: DeletedAccountMessage,
    args: {
        accountName: 'deleted-account',
        onClose: () => undefined,
    },
};

export default meta;
type Story = StoryObj<typeof DeletedAccountMessage>;

export const Default: Story = {};
