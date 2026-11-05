import {type Page, expect} from '@playwright/test';
import type {YTConfig} from '../../../../src/shared/yt-types';
import {makeClusterUrl} from '../../../utils';
import {basePage} from '../../../widgets/BasePage';

export const markdownAnswer = '## Query\n\nThis query returns a number.\n\n```sql\nSELECT 1;\n```';

export async function prepareChatPage(page: Page) {
    await basePage(page).override_window__DATA__(
        {aiChatConfig: {baseUrl: 'https://ai-chat.invalid', defaultModel: 'test-model'}},
        {
            'global::development::showAiChat': true,
            'global::theme': 'light',
            'global::a11y::useSafeColors': false,
            'global::navigationPanelExpand': true,
        },
    );
    await page.route('**/api/code-assistant/**', async (route) => {
        const {pathname} = new URL(route.request().url());
        switch (pathname) {
            case '/api/code-assistant/models':
                await route.fulfill({json: {data: [{id: 'test-model'}]}});
                return;
            case '/api/code-assistant/create-conversation':
                await route.fulfill({json: {id: 'conv_new', created_at: 1700000000}});
                return;
            case '/api/code-assistant/conversations':
                await route.fulfill({
                    json: {
                        data: [
                            {
                                id: 'conv_saved',
                                created_at: 1700000000,
                                metadata: {topic: 'Saved conversation'},
                            },
                        ],
                        has_more: false,
                        last_id: 'conv_saved',
                    },
                });
                return;
            case '/api/code-assistant/conversations/conv_saved/items':
                await route.fulfill({
                    json: {
                        data: [
                            {
                                id: 'saved-answer',
                                type: 'message',
                                role: 'assistant',
                                content: [{type: 'output_text', text: 'Saved answer'}],
                            },
                            {
                                id: 'saved-question',
                                type: 'message',
                                role: 'user',
                                content: [{type: 'input_text', text: 'Saved question'}],
                            },
                        ],
                        has_more: false,
                    },
                });
                return;
            case '/api/code-assistant/conversations/conv_new/summarize-title':
                await route.fulfill({json: {title: 'New conversation'}});
                return;
            default:
                // Never forward unexpected requests to the real AI service.
                await route.abort();
                throw new Error(`Unexpected AI chat request: ${pathname}`);
        }
    });
}

export async function openChat(page: Page, scenario: 'Empty' | 'Messages' | 'Error' = 'Empty') {
    if (scenario === 'Messages') {
        await page.route('**/api/code-assistant/conversations/conv_saved/items', (route) =>
            route.fulfill({
                json: {
                    data: [
                        {
                            id: 'answer',
                            type: 'message',
                            role: 'assistant',
                            content: [{type: 'output_text', text: markdownAnswer}],
                        },
                        {
                            id: 'question',
                            type: 'message',
                            role: 'user',
                            content: [{type: 'input_text', text: 'Explain this query'}],
                        },
                    ],
                    has_more: false,
                },
            }),
        );
    }
    await page.goto(makeClusterUrl('path-viewer'));
    // CI uses localmode, where the panel is hidden. Its AI API is mocked above.
    await page.evaluate(() => {
        (window as Window & {YT: YTConfig}).YT.isLocalCluster = false;
    });
    const modelsLoaded = page.waitForResponse('**/api/code-assistant/models');
    await page.getByRole('button', {name: 'AI chat', exact: true}).click();
    await modelsLoaded;
    await expect(page.getByTestId('ai-chat-model')).toContainText('test-model');
    if (scenario === 'Messages') {
        await page.getByTestId('oss-ai-chat-header-action-history').click();
        await page.getByText('Saved conversation', {exact: true}).click();
        await expect(page.getByText('SELECT 1;', {exact: true})).toBeVisible();
    }
    if (scenario === 'Error') {
        await page.route('**/api/code-assistant/send-message', (route) =>
            route.fulfill({
                contentType: 'text/event-stream',
                body: 'data: {"type":"error","error":"Unable to send message"}\n\n',
            }),
        );
        await page.getByTestId('oss-ai-chat').getByRole('textbox').fill('Explain this query');
        await page.getByTestId('oss-ai-chat-submit-button').click();
    }
}
