import {Buffer} from 'node:buffer';
import React from 'react';
import {expect, test} from '../../../../playwright-components/core';
import type {StoreType} from '../../../../store/store.main';
import {ChatStories} from '../__stories__';
import {chatHistoryHandlers, chatResponseHandler} from '../__stories__/mocks';

test('OssAiChat: resets only the draft when the panel reopens', async ({mount, page}) => {
    await mount(<ChatStories.Empty />);
    await page.getByRole('textbox').fill('Unsent question');
    await page.getByTestId('oss-ai-chat-header-action-close').click();
    await page.getByRole('button', {name: 'Open chat'}).click();
    await expect(page.getByRole('textbox')).toHaveValue('');
});
test('OssAiChat: displays user messages and markdown', async ({mount, page}) => {
    await mount(<ChatStories.Messages />);
    await expect(page.getByText('Explain this query', {exact: true})).toBeVisible();
    await expect(page.getByText('SELECT 1;', {exact: true})).toBeVisible();
});
test('OssAiChat: keeps the streamed response on reopen and prevents another send', async ({
    mount,
    page,
}) => {
    await mount(<ChatStories.Streaming />);
    await expect(page.getByTestId('oss-ai-chat-submit-button')).toBeDisabled();
    await page.getByTestId('oss-ai-chat-header-action-close').click();
    await page.getByRole('button', {name: 'Open chat'}).click();
    await expect(page.getByText('Still generating', {exact: true})).toBeVisible();
    await expect(page.getByTestId('oss-ai-chat-submit-button')).toBeDisabled();
});
test('OssAiChat: displays a failed message', async ({mount, page}) => {
    await mount(<ChatStories.Error />);
    await expect(page.getByText('Unable to send message', {exact: true})).toBeVisible();
});

test('OssAiChat: starts a new chat and keeps access to history', async ({mount, page}) => {
    await mount(<ChatStories.Messages />);
    await expect(page.getByTestId('oss-ai-chat-header-action-history')).toBeVisible();
    await page.getByTestId('oss-ai-chat-header-action-newChat').click();
    await expect(page.getByText('Explain this query', {exact: true})).toHaveCount(0);
    await expect(page.getByRole('textbox')).toHaveValue('');
});

for (const withAttachment of [false, true]) {
    test(`OssAiChat: sends a question${withAttachment ? ' with an attachment' : ''} and preserves the response on reopen`, async ({
        mount,
        page,
        router,
    }) => {
        await router.use(chatResponseHandler, ...chatHistoryHandlers);
        await mount(withAttachment ? <ChatStories.Attachments /> : <ChatStories.Empty />);
        await test.step('Send the question and receive the answer', async () => {
            const requestPromise = page.waitForRequest('**/api/code-assistant/send-message');
            await page.getByRole('textbox').fill('My question');
            await page.getByTestId('oss-ai-chat-submit-button').click();
            const request = await requestPromise;
            await expect(page.getByText('A streamed answer', {exact: true})).toBeVisible();
            expect(request.postDataJSON().input).toEqual([
                {
                    role: 'user',
                    content: [
                        {type: 'input_text', text: 'My question'},
                        ...(withAttachment
                            ? [{type: 'input_text', text: 'File: query.sql\n```\nSELECT 1;\n```'}]
                            : []),
                    ],
                },
            ]);
        });
        await test.step('Reopen the panel', async () => {
            await page.getByTestId('oss-ai-chat-header-action-close').click();
            await page.getByRole('button', {name: 'Open chat'}).click();
            await expect(page.getByText('A streamed answer', {exact: true})).toBeVisible();
        });
    });
}

for (const apply of [false, true]) {
    test(`OssAiChat: ${apply ? 'applies' : 'cancels'} attachment selection before sending`, async ({
        mount,
        page,
        router,
    }) => {
        await router.use(chatResponseHandler, ...chatHistoryHandlers);
        await mount(<ChatStories.Empty />);
        await test.step('Select a file and close the attachment dialog', async () => {
            await page.getByRole('button', {name: 'Attach files', exact: true}).click();
            const dialog = page.getByRole('dialog');
            await dialog.locator('input[type="file"]').setInputFiles({
                name: 'draft.sql',
                mimeType: 'text/plain',
                buffer: Buffer.from('SELECT 2;'),
            });
            await expect(dialog.getByText('draft.sql', {exact: true})).toBeVisible();
            await dialog
                .getByRole('button', {name: apply ? 'Apply' : 'Cancel', exact: true})
                .click();
            await expect(dialog).toBeHidden();
        });
        await test.step('Send only the confirmed attachments', async () => {
            const requestPromise = page.waitForRequest('**/api/code-assistant/send-message');
            await page.getByRole('textbox').fill('Explain');
            await page.getByTestId('oss-ai-chat-submit-button').click();
            const request = await requestPromise;
            expect(request.postDataJSON().input[0].content).toEqual([
                {type: 'input_text', text: 'Explain'},
                ...(apply
                    ? [{type: 'input_text', text: 'File: draft.sql\n```\nSELECT 2;\n```'}]
                    : []),
            ]);
        });
    });
}

test('OssAiChat: opens a saved conversation and sends only the next turn', async ({
    mount,
    page,
    router,
}) => {
    await router.use(chatResponseHandler, ...chatHistoryHandlers);
    await mount(<ChatStories.Empty />);
    await test.step('Load a previous conversation', async () => {
        await page.getByTestId('oss-ai-chat-header-action-history').click();
        await page.getByText('Saved conversation', {exact: true}).click();
        await expect(page.getByText('Saved question', {exact: true})).toBeVisible();
        await expect(page.getByText('Saved answer', {exact: true})).toBeVisible();
    });
    await test.step('Continue the selected conversation', async () => {
        const requestPromise = page.waitForRequest('**/api/code-assistant/send-message');
        await page.getByRole('textbox').fill('Continue');
        await page.getByTestId('oss-ai-chat-submit-button').click();
        const request = await requestPromise;
        expect(request.postDataJSON()).toEqual({
            conversation: 'conv_saved',
            input: [{role: 'user', content: [{type: 'input_text', text: 'Continue'}]}],
        });
        await expect(page.getByText('A streamed answer', {exact: true})).toBeVisible();
    });
});

test('OssAiChat: consumes AIKit reasoning and tools while the panel is closed', async ({
    mount,
    page,
}) => {
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
        finish = resolve;
    });
    await page.route('**/api/code-assistant/create-conversation', (route) =>
        route.fulfill({
            json: {id: 'conv_stream', created_at: 1700000000},
        }),
    );
    await page.route('**/api/code-assistant/send-message', async (route) => {
        await pending;
        const events = [
            {type: 'response.output_item.added', item: {id: 'r', type: 'reasoning'}},
            {
                type: 'response.reasoning_summary_text.delta',
                item_id: 'r',
                delta: 'Inspecting the query',
            },
            {
                type: 'response.output_item.done',
                item: {id: 'r', type: 'reasoning', summary: [{text: 'Inspecting the query'}]},
            },
            {
                type: 'response.output_item.added',
                item: {id: 'tool', type: 'mcp_call', name: 'get_table_schema', arguments: '{}'},
            },
            {
                type: 'response.output_item.done',
                item: {
                    id: 'tool',
                    type: 'mcp_call',
                    name: 'get_table_schema',
                    status: 'completed',
                    output: 'Schema',
                },
            },
            {type: 'response.output_text.delta', delta: 'Finished in background'},
            {type: 'response.completed'},
        ];
        await route.fulfill({
            contentType: 'text/event-stream',
            body: events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(''),
        });
    });
    await mount(<ChatStories.Empty />);
    await test.step('Close the panel before the response arrives', async () => {
        const request = page.waitForRequest('**/api/code-assistant/send-message');
        await page.getByRole('textbox').fill('Explain');
        await page.getByTestId('oss-ai-chat-submit-button').click();
        await request;
        await page.getByTestId('oss-ai-chat-header-action-close').click();
    });
    await test.step('Reopen and inspect the response prepared by AIKit', async () => {
        finish();
        await expect
            .poll(() =>
                page.evaluate(
                    () => (window as unknown as {store: StoreType}).store.getState().aiChat.sending,
                ),
            )
            .toBe(false);
        await page.getByRole('button', {name: 'Open chat'}).click();
        await expect(page.getByText('Finished in background', {exact: true})).toBeVisible();
        await expect(page.getByText('get_table_schema', {exact: true})).toBeVisible();
    });
});
