import React from 'react';

import {expect, test} from '../../../../playwright-components/core';
import {CreationOptionsTestComponent} from './CreationOptionsTestComponent';

for (const context of ['cluster', 'admin'] as const) {
    test(`creation options: retry after changing ${context}`, async ({mount, page}) => {
        let finishFirstRequest!: () => void;
        const firstRequest = new Promise<void>((resolve) => {
            finishFirstRequest = resolve;
        });
        let requests = 0;
        await page.route('**/api/strawberry/chyt/**/describe*', async (route) => {
            if (++requests === 1) await firstRequest;
            await route.fulfill({json: {commands: [], clusters: []}}).catch(() => {
                // The first request is cancelled when the context changes.
            });
        });
        const component = await mount(<CreationOptionsTestComponent context={context} />);
        await component.getByRole('button', {name: 'Load', exact: true}).click();
        await expect(component.locator('output')).toHaveText('Loading');
        await expect.poll(() => requests).toBe(1);
        await component.getByRole('button', {name: 'Switch context'}).click();
        await expect(component.locator('output')).toHaveText('Idle');
        await component.getByRole('button', {name: 'Switch context'}).click();
        finishFirstRequest();
        await component.getByRole('button', {name: 'Load', exact: true}).click();
        await expect(component.locator('output')).toHaveText('Ready');
        expect(requests).toBe(2);
    });
}
