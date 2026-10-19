import {test as base, expect} from './navigation';
import {ytApi} from '../utils/yt-api';

interface ResourceLimits {
    node_count?: number;
    disk_space_per_medium?: Record<string, number>;
}

interface AccountsFixture {
    name(label: string): string;
    create(label: string, parent?: string, limits?: ResourceLimits): Promise<string>;
    get(account: string, attribute: string): Promise<unknown>;
    exists(account: string): Promise<unknown>;
}

export const test = base.extend<{accounts: AccountsFixture}>({
    accounts: async ({navigation}, use, testInfo) => {
        const suffix = `${testInfo.testId.slice(-12)}-${testInfo.workerIndex}-${Date.now()}`;
        const names = new Set<string>();
        const name = (label: string) => {
            const result = `e2e-editor-${label}-${suffix}`;
            names.add(result);
            return result;
        };

        const errors: unknown[] = [];
        try {
            await use({
                name,
                create: async (label, parent = 'root', limits = {node_count: 100}) => {
                    const account = name(label);
                    await ytApi.create({
                        type: 'account',
                        attributes: {
                            name: account,
                            parent_name: parent,
                            resource_limits: limits,
                        },
                    });
                    return account;
                },
                get: (account, attribute) =>
                    ytApi.get({path: `//sys/accounts/${account}/@${attribute}`}),
                exists: (account) => ytApi.exists({path: `//sys/accounts/${account}`}),
            });
        } catch (error) {
            errors.push(error);
        } finally {
            // Nodes must release their resources before their accounts can be removed.
            try {
                await navigation.cleanup();
            } catch (error) {
                errors.push(error);
            }
            for (const account of [...names].reverse()) {
                try {
                    // Removing a parent can wait for its children's cross-cell synchronization.
                    await expect(async () => {
                        await ytApi.remove({path: `//sys/accounts/${account}`, force: true});
                    }).toPass({timeout: 20000});
                } catch (error) {
                    errors.push(error);
                }
            }
        }
        if (errors.length) {
            throw new AggregateError(errors, 'Failed to clean up accounts');
        }
    },
});

export {expect};
