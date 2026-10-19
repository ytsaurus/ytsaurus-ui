import {test as base, expect} from '@playwright/test';

import {ytApi} from '../utils/yt-api';

interface NavigationFixture {
    register(path: string): string;
    create(path: string, account?: string): Promise<string>;
    get(path: string): Promise<unknown>;
    exists(path: string): Promise<unknown>;
    cleanup(): Promise<void>;
}

export const test = base.extend<{navigation: NavigationFixture}>({
    // eslint-disable-next-line no-empty-pattern
    navigation: async ({}, use) => {
        const paths = new Set<string>();
        const register = (path: string) => {
            paths.add(path);
            return path;
        };
        const cleanup = async () => {
            const errors: unknown[] = [];
            for (const path of [...paths].reverse()) {
                try {
                    await ytApi.remove({path, recursive: true, force: true});
                    paths.delete(path);
                } catch (error) {
                    errors.push(error);
                }
            }
            if (errors.length) {
                throw new AggregateError(errors, 'Failed to clean up navigation nodes');
            }
        };

        try {
            await use({
                register,
                create: async (path, account) => {
                    register(path);
                    await ytApi.create({type: 'map_node', path, attributes: {account}});
                    return path;
                },
                get: (path) => ytApi.get({path}),
                exists: (path) => ytApi.exists({path}),
                cleanup,
            });
        } finally {
            await cleanup();
        }
    },
});

export {expect};
