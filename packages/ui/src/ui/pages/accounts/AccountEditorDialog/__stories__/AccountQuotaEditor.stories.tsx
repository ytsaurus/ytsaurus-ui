import React from 'react';
import {type Meta, type StoryObj} from '@storybook/react';

import {AccountResourceName} from '../../../../constants/accounts/accounts';
import {type AccountsTree} from '../../../../store/selectors/accounts/accounts-ts';
import {type AccountQuotaParams} from '../../../../utils/accounts/account-quota';
import {AccountQuotaEditor} from '../../AccountQuota/AccountQuotaEditor';

interface StoryProps {
    child?: boolean;
}

function makeAccount(name: string, parent: string, limit: number, total: number) {
    return {
        $attributes: {
            resource_limits: {node_count: limit},
            resource_usage: {node_count: total},
            recursive_resource_usage: {node_count: total},
            total_children_resource_limits: {node_count: 0},
        },
        name,
        parent,
        getNodeCountProgressInfo: () => ({
            committed: total,
            uncommitted: 0,
            total,
            limit,
            progress: (total / limit) * 100,
            progressText: `${total} / ${limit}`,
        }),
    };
}

function AccountQuotaStory({child}: StoryProps) {
    const [result, setResult] = React.useState<AccountQuotaParams>();
    const currentAccount = child ? 'child' : 'top';
    const current = makeAccount(currentAccount, child ? 'source' : 'root', 10, 2);
    const source = makeAccount('source', 'root', 100, 20);
    const currentNode = {
        name: currentAccount,
        parent: child ? 'source' : '<Root>',
        attributes: current,
        children: [],
        leaves: [],
    };
    const sourceNode = {
        name: 'source',
        parent: '<Root>',
        attributes: source,
        children: child ? [currentNode] : [],
        leaves: [],
    };
    const accountsTree = (child
        ? {[currentAccount]: currentNode, source: sourceNode}
        : {[currentAccount]: currentNode}) as unknown as Record<string, AccountsTree>;

    return (
        <div style={{width: 720, padding: 20}}>
            <AccountQuotaEditor
                title="Nodes"
                type={AccountResourceName.NODE_COUNT}
                currentAccount={currentAccount}
                activeAccount={currentAccount}
                accountsTree={accountsTree}
                sources={child ? ['source'] : []}
                setAccountQuota={setResult}
            />
            {result && <pre data-qa="quota-result">{JSON.stringify(result)}</pre>}
        </div>
    );
}

const meta: Meta<typeof AccountQuotaStory> = {
    title: 'Pages/Accounts/AccountEditor/Quota',
    component: AccountQuotaStory,
};

export default meta;
type Story = StoryObj<typeof AccountQuotaStory>;

export const TopLevel: Story = {};
export const ChildWithTransfer: Story = {args: {child: true}};
