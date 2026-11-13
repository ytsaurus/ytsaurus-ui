import {Buffer} from 'node:buffer';
import {expect, test} from '@playwright/test';
import {openChat, prepareChatPage} from './fixtures';

test.beforeEach(async ({page}) => {
    await prepareChatPage(page);
});

test('AI chat: empty panel', async ({page}) => {
    await test.step('Open the application with an empty AI chat', async () => {
        await openChat(page);
    });

    await test.step('Capture the ready empty state', async () => {
        const chat = page.getByTestId('oss-ai-chat');
        await expect(chat.getByTestId('oss-ai-chat-empty-state')).toBeVisible();
        await expect(chat.getByText("Hi, I'm Ai chat!", {exact: true})).toBeVisible();
        await expect(chat.getByRole('textbox')).toBeEditable();
        await expect(chat.getByRole('textbox')).toHaveValue('');
        await expect(chat.getByTestId('ai-chat-model')).toContainText('test-model');
        await expect(chat.getByRole('alert')).toHaveCount(0);
        await expect(chat.getByTestId('oss-ai-chat-submit-button')).toBeDisabled();
        await page.mouse.move(0, 0);
        await expect(chat).toHaveScreenshot();
    });
});

test('AI chat: displays user messages and markdown', async ({page}) => {
    await openChat(page, 'Messages');
    await expect(page.getByText('Explain this query', {exact: true})).toBeVisible();
    await expect(page.getByText('SELECT 1;', {exact: true})).toBeVisible();
    await expect(page.getByRole('heading', {name: 'Query', exact: true})).toBeVisible();
    const chat = page.getByTestId('oss-ai-chat');
    await expect(chat.getByRole('textbox')).toBeEnabled();
    await page.mouse.move(0, 0);
    await expect(chat).toHaveScreenshot();
});

test('AI chat: attachment dialog', async ({page}) => {
    await openChat(page);
    await page.getByRole('button', {name: 'Attach files', exact: true}).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('input[type="file"]').setInputFiles({
        name: 'draft.sql',
        mimeType: 'text/plain',
        buffer: Buffer.from('SELECT 2;'),
    });
    await expect(dialog.getByText('draft.sql', {exact: true})).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(dialog).toHaveScreenshot();
});

test('AI chat: history', async ({page}) => {
    await openChat(page);
    await page.getByTestId('oss-ai-chat-header-action-history').click();
    await expect(page.getByText('Saved conversation', {exact: true})).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page.getByTestId('oss-ai-chat')).toHaveScreenshot();
});

test('AI chat: reasoning and tools', async ({page}) => {
    await page.route('**/api/code-assistant/send-message', async (route) => {
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
            {type: 'response.output_text.delta', delta: 'Query explained'},
            {type: 'response.completed'},
        ];
        await route.fulfill({
            contentType: 'text/event-stream',
            body: events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(''),
        });
    });
    await openChat(page, 'Empty');
    await page.getByTestId('oss-ai-chat').getByRole('textbox').fill('Explain');
    await page.getByTestId('oss-ai-chat-submit-button').click();
    await expect(page.getByText('Query explained', {exact: true})).toBeVisible();
    await expect(page.getByText('get_table_schema', {exact: true})).toBeVisible();
    const chat = page.getByTestId('oss-ai-chat');
    await expect(chat.getByRole('textbox')).toBeEnabled();
    await page.mouse.move(0, 0);
    await expect(chat).toHaveScreenshot();
});

test('AI chat: pending response', async ({page}) => {
    await page.route('**/api/code-assistant/send-message', () => undefined);
    await openChat(page);
    const request = page.waitForRequest('**/api/code-assistant/send-message');
    const chat = page.getByTestId('oss-ai-chat');
    await chat.getByRole('textbox').fill('Explain');
    await chat.getByTestId('oss-ai-chat-submit-button').click();
    await request;
    await expect(chat.getByRole('textbox')).toBeDisabled();
    await page.mouse.move(0, 0);
    await expect(chat).toHaveScreenshot();
});
