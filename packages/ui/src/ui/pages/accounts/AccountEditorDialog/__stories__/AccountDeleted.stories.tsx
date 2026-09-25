import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

import {DeletedAccountMessage} from '../AccountEditor';

function DeletedAccountStory({accountName}: {accountName: string}) {
    const [visible, setVisible] = React.useState(true);

    return visible ? (
        <div role="dialog">
            <DeletedAccountMessage accountName={accountName} onClose={() => setVisible(false)} />
        </div>
    ) : (
        <div>Editor closed</div>
    );
}

const meta: Meta<typeof DeletedAccountStory> = {
    title: 'Pages/Accounts/AccountEditor/Deleted',
    component: DeletedAccountStory,
    args: {
        accountName: 'deleted-account',
    },
};

export default meta;
type Story = StoryObj<typeof DeletedAccountStory>;

export const Default: Story = {};
